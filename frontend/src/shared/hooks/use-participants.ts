import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  apiStampsAtom,
  apiUsersAtom,
  isDetailOpenAtom,
  type ParticipantDetailData,
  participantsAtom,
  selectedParticipantAtom,
  type Stamp,
  userProfileAtom,
  userStampCountsAtom,
} from "@/shared/store/atoms";
import { MY_PROFILE_ID } from "@/shared/constants";
import { listUsers, getUser } from "@/shared/api/generated/users/users";
import { listStamps } from "@/shared/api/generated/stamps/stamps";
import { listUserStamps } from "@/shared/api/generated/user-stamps/user-stamps";
import { codesToLabels } from "@/shared/types/user";

export function useParticipants() {
  const router = useRouter();
  const participants = useAtomValue(participantsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const [selectedParticipant, setSelectedParticipant] = useAtom(selectedParticipantAtom);
  const [isDetailOpen, setIsDetailOpen] = useAtom(isDetailOpenAtom);
  const setApiUsers = useSetAtom(apiUsersAtom);
  const setApiStamps = useSetAtom(apiStampsAtom);
  const setUserStampCounts = useSetAtom(userStampCountsAtom);
  const apiStamps = useAtomValue(apiStampsAtom);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stampsResponse = await listStamps({ limit: 100, offset: 0 });
        setApiStamps(stampsResponse.stamps || []);

        const users = await listUsers();
        setApiUsers(users);

        const countsEntries = await Promise.all(
          users.map(async (user) => {
            try {
              const response = await listUserStamps(user.id);
              const allStampIds = (response.stamps || []).map((s) => s.stamp_id);
              const uniqueStampIds = new Set(allStampIds);
              return [user.id, uniqueStampIds.size] as const;
            } catch (error) {
              console.error(`Failed to fetch stamps for user ${user.id}:`, error);
              return [user.id, 0] as const;
            }
          })
        );
        setUserStampCounts(Object.fromEntries(countsEntries));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setApiUsers, setApiStamps, setUserStampCounts]);

  const handleParticipantClick = useCallback(
    async (participantId: number) => {
      setIsDetailOpen(false);
      setSelectedParticipant(null);

      if (participantId === MY_PROFILE_ID && userProfile) {
        router.push("/profile");
        return;
      }

      try {
        const userDetail = await getUser(participantId);

        let acquiredStampIds: Set<number>;
        const isMyself = userProfile && participantId === Number(userProfile.id);

        if (isMyself) {
          const userStampsStorage = localStorage.getItem("gopher_stamp_rally_user_stamps");
          if (userStampsStorage) {
            const userStampsMap = JSON.parse(userStampsStorage);
            const myStamps = userStampsMap[userProfile.id] || [];
            acquiredStampIds = new Set(myStamps);
          } else {
            acquiredStampIds = new Set();
          }
        } else {
          const userStampsResponse = await listUserStamps(participantId);
          const allStampIds = (userStampsResponse.stamps || []).map((s) => s.stamp_id);
          acquiredStampIds = new Set(allStampIds);
        }

        const stamps: Stamp[] = apiStamps.map((stamp) => ({
          id: stamp.id,
          name: stamp.name,
          isCollected: acquiredStampIds.has(stamp.id),
        }));

        const favoriteGoFeatureCodes = userDetail.favorite_go_feature || "";
        const favoriteGoFeatureLabels = codesToLabels(favoriteGoFeatureCodes);
        const interestsText = favoriteGoFeatureLabels.length > 0 ? favoriteGoFeatureLabels.join("、") : "未設定";

        const participantDetail: ParticipantDetailData = {
          id: userDetail.id,
          name: userDetail.name,
          affiliation: "",
          interests: interestsText,
          twitterId: userDetail.twitter_id || "未設定",
          stamps,
        };

        setSelectedParticipant(participantDetail);
        setIsDetailOpen(true);
      } catch (error) {
        console.error("Failed to fetch user detail:", error);
        alert("ユーザー詳細の取得に失敗しました。時間をおいて再度お試しください。");
      }
    },
    [userProfile, router, setSelectedParticipant, setIsDetailOpen, apiStamps]
  );

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, [setIsDetailOpen]);

  return {
    participants,
    isLoading,
    selectedParticipant,
    isDetailOpen,
    handleParticipantClick,
    handleCloseDetail,
  };
}






