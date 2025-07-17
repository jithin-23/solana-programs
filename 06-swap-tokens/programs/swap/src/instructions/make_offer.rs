use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use super::transfer_tokens;

use crate::{Offer};

#[derive(Accounts)]
#[instruction(id:u64)]
pub struct MakeOffer<'info> {
    #[account(mut)]
    pub user1: Signer<'info>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = user1,
        associated_token::token_program = token_program
    )]
    pub user1_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        space = 8 + Offer::INIT_SPACE,
        payer = user1,
        seeds = [b"offer", user1.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        init,
        payer = user1,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn send_offered_tokens_to_vault(
    ctx: &Context<MakeOffer>,
    token_a_offered_amount: u64,
) -> Result<()> {
    transfer_tokens(
        &ctx.accounts.user1_token_account_a,
        &ctx.accounts.vault,
        &token_a_offered_amount,
        &ctx.accounts.token_mint_a,
        &ctx.accounts.user1,
        &ctx.accounts.token_program,
    )?;
    msg!(
        "Send {} token(s) of mint {} to vault {}",
        token_a_offered_amount,
        ctx.accounts.token_mint_a.key(),
        ctx.accounts.vault.key()
    );

    Ok(())
}

pub fn save_offer(ctx:Context<MakeOffer>, id: u64, token_b_wanted_amount: u64) -> Result<()> {
    ctx.accounts.offer.set_inner(Offer {
        id,
        user1: ctx.accounts.user1.key(),
        token_mint_a: ctx.accounts.token_mint_a.key(),
        token_mint_b: ctx.accounts.token_mint_b.key(),
        token_b_wanted_amount,
        bump: ctx.bumps.offer,
    });

    msg!("New Offer with id {} Created and saved", id);
    Ok(())
}
