'use client';
import Content from "../components/Content";
import { useEffect } from "react";
import { useUserStore } from "../../store/store";
import { getUser } from "../lib/api";
import RightSide from "../components/RightSide";
import JokeDisplay from "../components/JokeDisplay";
import FloatingEmojis from "../components/FloatingEmojis";
import { useRouter } from "next/navigation";
import { Headphones } from "lucide-react";

export default function AppHome() {
  const { user, setUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUser();
      console.log("From intial", res);
      const apiUser = res?.data?.user;
      if (apiUser) {
        setUser({
          id: apiUser._id,
          name: apiUser.name,
          email: apiUser.email,
          username: apiUser.username,
          profileImage: apiUser.profileImage,
        });
      }
    }

    if (!user) fetchUser();
  }, [user, setUser])

  return (
    <div className="flex-1 flex gap-6 p-6 overflow-y-auto h-full relative">
      {/* Center Feed */}
      <section className="flex-1 max-w-5xl mx-auto">
        <div className="space-y-6">
          {/* Want to Get Heard Link */}
          <button
            onClick={() => router.push("/listening")}
            className="group relative overflow-hidden rounded-xl bg-linear-to-r from-pink-500/80 via-purple-500/80 to-indigo-500/80 p-px transition-all hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <div className="relative flex items-center gap-3 rounded-xl bg-[#1a0030] px-5 py-3 transition-all group-hover:bg-opacity-90">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-pink-500/20 to-purple-500/20">
                <Headphones className="h-5 w-5 text-pink-400" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-white">Want to get heard?</h3>
                <p className="text-xs text-white/50">Connect with a listener</p>
              </div>
              <div className="ml-auto rounded-full bg-white/5 p-1.5 transition-colors group-hover:bg-white/10">
                <svg
                  className="h-4 w-4 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Joke Display with Floating Emojis */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <JokeDisplay />
            </div>
            <FloatingEmojis />
          </div>
          <Content />
        </div>
      </section>
      
      {/* Right Sidebar */}
      <aside className="w-80 shrink-0 hidden xl:block">
        <RightSide />
      </aside>
    </div>
  );
}

