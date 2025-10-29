import {useMutation} from '@apollo/client';
import type {User} from '@features/auth';
import {
  UPDATE_RARE_CANDY_MUTATION,
  UPGRADE_STAT_MUTATION,
  type UpdateRareCandyData,
  type UpgradeStatData,
} from '@/lib/graphql';
import {logger} from '@/lib/logger';

export function useGameMutations() {
  const [updateRareCandyMutation, {loading: updatingCandy, error: candyError}] =
    useMutation<UpdateRareCandyData>(UPDATE_RARE_CANDY_MUTATION);

  const [upgradeStatMutation, {loading: upgradingStat, error: statError}] =
    useMutation<UpgradeStatData>(UPGRADE_STAT_MUTATION);

  const updateRareCandy = async (
    amount: number,
    onCompleted?: (user: User) => void
  ) => {
    try {
      const result = await updateRareCandyMutation({
        variables: {amount},
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
