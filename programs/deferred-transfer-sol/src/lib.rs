use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, SetAuthority, TokenAccount, Transfer};
use spl_token::instruction::AuthorityType;

declare_id!("AWsJRTdz8avaQfbLevLiLehYp4H6oi9KoqHWhxYXFEWE");

#[program]
pub mod deferred_transfer_sol {
    use super::*;

    // initialize account, prepare and save state
    pub fn initialize(ctx: Context<Initialize>, amount: u64, _bump: u8) -> ProgramResult {
        token::transfer(ctx.accounts.into_transfer_context(), amount)?;

        token::set_authority(
            ctx.accounts.into_set_authority_context(),
            AuthorityType::AccountOwner,
            Some(ctx.accounts.state.to_account_info().key.clone()),
        )?;

        let state = &mut ctx.accounts.state;

        state.amount = amount;
        state.days_to_transfer = 10;
        state.days_left = state.days_to_transfer;
        state.initializer = *ctx.accounts.initializer.to_account_info().key;
        state.token_account = *ctx.accounts.token_account.to_account_info().key;
        state.receiver = *ctx.accounts.receiver.to_account_info().key;

        Ok(())
    }

    // script action. check if there are days left: if no days left - do transfer, if not - decrement days left
    pub fn check_days(ctx: Context<CheckDays>, bump: u8) -> ProgramResult {
        let initializer_bytes = ctx.accounts.state.initializer.to_bytes();
        let seeds = [initializer_bytes[..].as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let state = &mut ctx.accounts.state;

        if state.days_left == 0 {
            token::set_authority(
                ctx.accounts
                    .into_set_authority_context()
                    .with_signer(signer),
                AuthorityType::AccountOwner,
                Some(ctx.accounts.state.receiver),
            )?;

            // TODO: close state account
            // ctx.accounts.state.close(state.initializer);
        } else {
            state.days_left -= 1;
        }

        Ok(())
    }

    // user action. reset days left
    pub fn check_in(ctx: Context<CheckIn>) -> ProgramResult {
        let state = &mut ctx.accounts.state;

        state.days_left = state.days_to_transfer;

        Ok(())
    }

    // return tokens to initializer
    pub fn withdraw(ctx: Context<Withdraw>) -> ProgramResult {
        let state = &ctx.accounts.state;

        token::transfer(ctx.accounts.into_transfer_context(), state.amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(amount: u64, bump: u8)]
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        seeds = [&initializer.to_account_info().key.to_bytes()],
        bump = bump,
        payer = initializer,
        space = 2048,
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    // token account of initializer from which tokens will be sent to transfer account
    #[account(mut)]
    token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = initializer,
        token::mint = mint_account,
        token::authority = initializer,
    )]
    transfer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    mint_account: Account<'info, Mint>,
    receiver: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    system_program: Program<'info, System>,
    rent: Sysvar<'info, Rent>,
}

impl<'info> Initialize<'info> {
    fn into_transfer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.token_account.to_account_info(),
            to: self.transfer_token_account.to_account_info(),
            authority: self.initializer.to_account_info(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.transfer_token_account.to_account_info().clone(),
            current_authority: self.initializer.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct CheckDays<'info> {
    #[account(mut)]
    state: Account<'info, State>,
    #[account(mut)]
    transfer_token_account: Account<'info, TokenAccount>,
    token_program: AccountInfo<'info>,
}

impl<'info> CheckDays<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.transfer_token_account.to_account_info().clone(),
            current_authority: self.state.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct CheckIn<'info> {
    #[account(mut)]
    state: Account<'info, State>,
    #[account(mut)]
    initializer: Signer<'info>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        close = initializer,
    )]
    state: Account<'info, State>,
    #[account(mut)]
    initializer: Signer<'info>,
    #[account(mut)]
    token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        close = initializer,
    )]
    transfer_token_account: Account<'info, TokenAccount>,
    token_program: AccountInfo<'info>,
}

impl<'info> Withdraw<'info> {
    fn into_transfer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.transfer_token_account.to_account_info(),
            to: self.token_account.to_account_info(),
            authority: self.state.to_account_info(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

#[account]
pub struct State {
    pub amount: u64,
    pub days_to_transfer: u16,
    pub days_left: u16,
    pub token_account: Pubkey,
    pub initializer: Pubkey,
    pub receiver: Pubkey,
}
