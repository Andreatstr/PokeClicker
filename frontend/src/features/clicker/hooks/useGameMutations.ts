import {gql, useMutation} from '@apollo/client';
import type {User} from '@features/auth';

const UPDATE_RARE_CANDY = gql`
  mutation UpdateRareCandy($amount: Int!) {
    updateRareCandy(amount: $amount) {
      _id
      username
      rare_candy
      created_at
      stats {
        hp
        attack
        defense
        spAttack
        spDefense
        speed
        clickPower
        passiveIncome
      }
      owned_pokemon_ids
      favorite_pokemon_id
      selected_pokemon_id
    }
  }
`;

const UPGRADE_STAT = gql`
  mutation UpgradeStat($stat: String!) {
    upgradeStat(stat: $stat) {
      _id
      username
      rare_candy
      created_at
      stats {
        hp
        attack
        defense
        spAttack
        spDefense
        speed
        clickPower
        passiveIncome
      }
      owned_pokemon_ids
      favorite_pokemon_id
      selected_pokemon_id
    }
  }
`;

export function useGameMutations() {
  const [updateRareCandyMutation, {loading: updatingCandy, error: candyError}] =
    useMutation<{updateRareCandy: User}>(UPDATE_RARE_CANDY);

  const [upgradeStatMutation, {loading: upgradingStat, error: statError}] =
    useMutation<{upgradeStat: User}>(UPGRADE_STAT);

  const updateRareCandy = async (
    amount: number,
    onCompleted?: (user: User) => void
  ) => {
    try {
      const result = await updateRareCandyMutation({
        variables: {amount},
      });

      if (result.data?.updateRareCandy && onCompleted) {
        onCompleted(result.data.updateRareCandy);
      }

      return result.data?.updateRareCandy;
    } catch (error) {
      console.error('Failed to update rare candy:', error);
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

      if (result.data?.upgradeStat && onCompleted) {
        onCompleted(result.data.upgradeStat);
      }

      return result.data?.upgradeStat;
    } catch (error) {
      console.error('Failed to upgrade stat:', error);
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
