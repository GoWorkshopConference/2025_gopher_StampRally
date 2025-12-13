import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  userAcquiredStampsMapAtom,
  userProfileAtom,
  userStampCountsAtom,
} from "@/shared/store/atoms";
import { MY_PROFILE_ID } from "@/shared/constants";
import { listUsers, getUser } from "@/shared/api/generated/users/users";
import { listStamps } from "@/shared/api/generated/stamps/stamps";
import { listUserStamps } from "@/shared/api/generated/user-stamps/user-stamps";
import { codesToLabels } from "@/shared/types/user";
import { customInstance } from "@/shared/api/mutator";

// UserWithStamps型を共有できるように外部定義
type UserWithStamps = {
  id: number;
  name: string;
  twitter_id?: string;
  favorite_go_feature?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  stamp_ids?: number[];
};

export function useParticipants() {
  const router = useRouter();
  const participants = useAtomValue(participantsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const [selectedParticipant, setSelectedParticipant] = useAtom(selectedParticipantAtom);
  const [isDetailOpen, setIsDetailOpen] = useAtom(isDetailOpenAtom);
  const setApiUsers = useSetAtom(apiUsersAtom);
  const setApiStamps = useSetAtom(apiStampsAtom);
  const setUserStampCounts = useSetAtom(userStampCountsAtom);
  const setUserAcquiredStampsMap = useSetAtom(userAcquiredStampsMapAtom);
  const apiStamps = useAtomValue(apiStampsAtom);
  const apiUsers = useAtomValue(apiUsersAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const fetchAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 既にデータが存在する場合は再取得しない（初期化済みの場合）
    if (isInitialized) {
      return;
    }

    // データが既に存在する場合はローディングを解除
    if (apiStamps.length > 0 && apiUsers.length > 0) {
      setIsInitialized(true);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      // 前回のリクエストをキャンセル
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }

      // 新しいAbortControllerを作成
      const abortController = new AbortController();
      fetchAbortControllerRef.current = abortController;

      try {
        // スタンプとユーザーを並列で取得
        const [stampsResponse, usersWithStamps] = await Promise.all([
          listStamps({ limit: 100, offset: 0 }),
          customInstance<UserWithStamps[]>({
            url: "/users",
            method: "GET",
            params: { include_stamp_counts: "true" },
            signal: abortController.signal,
          }),
        ]);

        // リクエストがキャンセルされた場合は処理を中断
        if (abortController.signal.aborted) {
          return;
        }

        setApiStamps(stampsResponse.stamps || []);

        // Extract users and stamp information
        const users = usersWithStamps.map((item: UserWithStamps) => ({
          id: item.id,
          name: item.name,
          twitter_id: item.twitter_id,
          favorite_go_feature: item.favorite_go_feature,
          icon: item.icon,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
        setApiUsers(users);

        // Process stamp counts and stamp IDs
        const countsEntries: [number, number][] = [];
        const stampsMapEntries: [number, number[]][] = [];

        usersWithStamps.forEach((item: UserWithStamps) => {
          const stampIds = item.stamp_ids || [];
          const uniqueStamps = Array.from(new Set(stampIds)) as number[];
          countsEntries.push([item.id, uniqueStamps.length]);
          stampsMapEntries.push([item.id, uniqueStamps]);
        });

        setUserStampCounts(Object.fromEntries(countsEntries));
        setUserAcquiredStampsMap(Object.fromEntries(stampsMapEntries));
        setIsInitialized(true);
      } catch (error) {
        // AbortErrorの場合はログに出力しない
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch data:", error);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // クリーンアップ関数
    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, [setApiUsers, setApiStamps, setUserStampCounts, setUserAcquiredStampsMap, apiStamps.length, apiUsers.length, isInitialized]);

  const userAcquiredStampsMap = useAtomValue(userAcquiredStampsMapAtom);

  const handleParticipantClick = useCallback(
    async (participantId: number) => {
      setIsDetailOpen(false);
      setSelectedParticipant(null);

      if (participantId === MY_PROFILE_ID && userProfile) {
        router.push("/profile");
        return;
      }

      try {
        // 既に取得済みのスタンプ情報を使用（キャッシュから）
        const cachedStampIds = userAcquiredStampsMap[participantId];
        let acquiredStampIds: Set<number>;
        const isMyself = userProfile && participantId === Number(userProfile.id);

        if (isMyself) {
          // 自分のスタンプはlocalStorageから取得
          const userStampsStorage = localStorage.getItem("gopher_stamp_rally_user_stamps");
          if (userStampsStorage) {
            const userStampsMap = JSON.parse(userStampsStorage);
            const myStamps = userStampsMap[userProfile.id] || [];
            acquiredStampIds = new Set(myStamps);
          } else {
            acquiredStampIds = new Set();
          }
        } else if (cachedStampIds !== undefined) {
          // キャッシュからスタンプIDを取得（undefinedでない限りキャッシュとして扱う）
          acquiredStampIds = new Set(cachedStampIds);
        } else {
          // キャッシュがない場合のみAPIから取得
          const userStampsResponse = await listUserStamps(participantId);
          const allStampIds = (userStampsResponse.stamps || []).map((s) => s.stamp_id);
          acquiredStampIds = new Set(allStampIds);
        }

        // ユーザー詳細情報を取得（詳細情報が必要なため常にAPIから取得）
        const userDetail = await getUser(participantId);

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
    [userProfile, router, setSelectedParticipant, setIsDetailOpen, apiStamps, userAcquiredStampsMap]
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



