import { useEffect, useState, useCallback } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { acquiredStampIdsAtom, apiStampsAtom, stampsAtom, userProfileAtom } from "@/shared/store/atoms";
import { fetchStampList, fetchStampDetail } from "@/shared/api/stamp-api";

export function useStamps() {
  const stamps = useAtomValue(stampsAtom);
  const setApiStamps = useSetAtom(apiStampsAtom);
  const acquiredStampIds = useAtomValue(acquiredStampIdsAtom);
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStamp, setSelectedStamp] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const fetchStamps = async () => {
      try {
        const response = await fetchStampList(100, 0);
        setApiStamps(response.stamps);

        if (userProfile && userProfile.totalCount !== response.stamps.length) {
          setUserProfile({
            ...userProfile,
            totalCount: response.stamps.length,
          });
        }

        if (userProfile?.id) {
          const userId = Number(userProfile.id);
          if (!isNaN(userId)) {
            if (userProfile.completedCount !== acquiredStampIds.size) {
              setUserProfile({
                ...userProfile,
                completedCount: acquiredStampIds.size,
                totalCount: response.stamps.length,
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch stamps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setApiStamps, setUserProfile, userProfile?.id]);

  const handleStampClick = useCallback(
    async (id: number) => {
      if (!userProfile?.id) {
        console.warn("No user profile found");
        return;
      }

      try {
        const stampDetail = await fetchStampDetail(id);
        setSelectedStamp(stampDetail);
      } catch (error) {
        console.error("Failed to show stamp detail:", error);
        alert(`スタンプの詳細表示に失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
    [userProfile?.id]
  );

  return {
    stamps,
    isLoading,
    selectedStamp,
    setSelectedStamp,
    handleStampClick,
    acquiredStampIds,
  };
}
