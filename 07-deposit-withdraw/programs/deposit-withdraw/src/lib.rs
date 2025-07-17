#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("6B7KJQgV5aboqafj6sEcVUvpDpe3nuEFsv9oRTNnJSKp");

#[program]
pub mod deposit_withdraw {

    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, VaultError::InvalidDepositAmount);
        let user_account = &mut ctx.accounts.user_account;

        if !user_account.is_initialized {
            user_account.user = ctx.accounts.user.key();
            user_account.is_initialized = true;
            user_account.vault_bump = ctx.bumps.vault;
        }

        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.system_program.to_account_info();

        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);

        system_program::transfer(cpi_context, amount)?;
        msg!("Deposited {} lamports to vault", amount);

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let vault_balance = ctx.accounts.vault.to_account_info().lamports();

        require!(vault_balance >= amount, VaultError::InsufficientFunds);

        let user_key = ctx.accounts.user.key();
        let seeds = [
            b"vault".as_ref(),
            user_key.as_ref(),
            &[ctx.accounts.user_account.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user.to_account_info(),
        };

        let cpi_program = ctx.accounts.system_program.to_account_info();

        let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds);

        system_program::transfer(cpi_context, amount)?;

        msg!("Withdrew {} lamports from vault", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        space = 8 + UserAccount::INIT_SPACE,
        payer = user,
        seeds = [user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub user: Pubkey,
    pub is_initialized: bool,
    pub vault_bump: u8,
}

#[account]
pub struct Vault {
    pub balance: u64,
}

#[error_code]
pub enum VaultError {
    #[msg("Insufficient funds in the vault")]
    InsufficientFunds,

    #[msg("Deposit amount must be greater than zero")]
    InvalidDepositAmount,
}
