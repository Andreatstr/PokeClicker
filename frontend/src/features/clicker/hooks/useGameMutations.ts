import {useMutation} from '@apollo/client';
import type {User} from '@features/auth';
import {
  UPDATE_RARE_CANDY_MUTATION,
  UPGRADE_STAT_MUTATION,
  type UpdateRareCandyData,
  type UpgradeStatData,
} from '@/lib/graphql';
import {logger} from '@/lib/logger';

/**
 * Hook providing clicker game mutations for currency and stat management
 *
 * Features:
 * - updateRareCandy: Updates user's Rare Candy balance (earned from clicking/passive income)
 * - upgradeStat: Upgrades a specific stat (hp, attack, defense, etc.) using Rare Candy
 * - Callbacks for updating local auth context after mutations complete
 * - Combined loading and error states for both mutations
 *
 * Usage:
 * - updateRareCandy called frequently to sync clicker state with server
 * - upgradeStat called when user purchases stat upgrades in clicker UI
 *
 * @returns Mutation functions, loading state, and error state
 */
export function useGameMutations() {
  const [updateRareCandyMutation, {loading: updatingCandy, error: candyError}] =
    useMutation<UpdateRareCandyData>(UPDATE_RARE_CANDY_MUTATION);

  const [upgradeStatMutation, {loading: upgradingStat, error: statError}] =
    useMutation<UpgradeStatData>(UPGRADE_STAT_MUTATION);

  const updateRareCandy = async (
    amount: number | string,
    onCompleted?: (user: User) => void
  ) => {
    try {
      const result = await updateRareCandyMutation({
        variables: {amount: amount.toString()},
      });

      if (result?.data?.updateRareCandy && onCompleted) {
        onCompleted(result.data.updateRareCandy);
      }

      return result?.data?.updateRareCandy;
    } catch (error) {
      logger.logError(error, 'UpdateRareCandy');
      throw error;
    }
  };

  const upgradeStat = async (
    stat: string,
    onCompleted?: (user: User) => void
  ) => {
    try {
      const result = await upgradeStatMutation({
        variables: {stat},
      });

      if (result?.data?.upgradeStat && onCompleted) {
        onCompleted(result.data.upgradeStat);
      }

      return result?.data?.upgradeStat;
    } catch (error) {
      logger.logError(error, 'UpgradeStat');
      throw error;
    }
  };

  return {
    updateRareCandy,
    upgradeStat,
    loading: updatingCandy || upgradingStat,
    error: candyError || statError,
  };
}
