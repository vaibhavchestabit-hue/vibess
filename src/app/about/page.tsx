"use client";

import { Heart, MessageCircle, Users, Lock, Radio, ArrowLeft, Ghost, Globe, Headphones } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0118] text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">
              Welcome to Vibess
            </h1>
            <p className="text-xl text-white/60">
              A guide to finding your wavelength.
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Section 1: What is Vibe */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 text-purple-300">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">What is Vibess?</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              Vibess is a place to connect based on how you <em>feel</em>, not just who you are. 
              Instead of static profiles, we use <strong>Vibe Cards</strong> to show your current mood, energy, and intent. 
              It&apos;s about finding people who match your wavelength right now.
            </p>
          </div>

          {/* Section 2: Ready to Listen */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 text-pink-400">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Ready to Listen</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              Sometimes we just need someone to hear us out. The <strong>Ready to Listen</strong> badge on your profile 
              signals that you&apos;re open to supporting others. It&apos;s a way to give back to the community and be a 
              gentle presence for someone who might be struggling.
            </p>
          </div>

          {/* Section 2.5: Want to Get Heard */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-colors md:col-span-2">
            <div className="flex items-center gap-3 text-purple-400">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Want to Get Heard?</h3>
            </div>
            <div className="space-y-2 text-white/80">
              <p>
                Need someone to talk to right now? The <strong>Want to Get Heard</strong> feature connects you 
                with available listeners in real-time for <strong>30-minute sessions</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-white/60 text-sm">
                <li>Choose what&apos;s on your mind (a thought, something heavy, or just random talk).</li>
                <li>Your request is broadcasted to listeners who are &quot;Ready to Listen&quot;.</li>
                <li>Pick from interested listeners and start a private, time-limited chat.</li>
                <li>Sessions are judgment-free and designed for support, not advice.</li>
                <li>After the session, you can provide feedback to help build trust in the community.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Chat Rooms */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 text-blue-400">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Chat Rooms</h3>
            </div>
            <div className="space-y-2 text-white/80">
              <p>
                Chat rooms are temporary, topic-based spaces for <strong>2 to 4 people</strong>. 
                They are perfect for quick, spontaneous conversations without the pressure of 1:1 messaging.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-white/60 text-sm">
                <li>Rooms disappear when empty.</li>
                <li>Great for finding your tribe.</li>
                <li>No long-term commitment required.</li>
              </ul>
            </div>
          </div>

          {/* Section 3.5: Groups */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 text-cyan-400">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Groups</h3>
            </div>
            <div className="space-y-2 text-white/80">
              <p>
                <strong>Groups</strong> start as temporary spaces (4 hours) to find your tribe. 
                If the vibe is right, you can unlock them to become <strong>permanent communities</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-white/60 text-sm">
                <li>Find your tribe based on shared interests or vibes.</li>
                <li>Unlock permanence if 3+ members agree.</li>
                <li>Perfect for hobbies, fandoms, or support circles.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Unlocking Chats */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 text-green-400">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Unlocking Chats</h3>
            </div>
            <div className="space-y-2 text-white/80">
              <p>
                To keep interactions meaningful, chats have special unlocking rules:
              </p>
              <ul className="list-disc pl-4 space-y-2 text-white/60 text-sm">
                <li>
                  <strong>1:1 Chat:</strong> Open by default for <strong>24 hours</strong> if vibes match. 
                  If you both <strong>follow each other</strong>, the chat unlocks forever. Otherwise, it locks after 24 hours.
                </li>
                <li>
                  <strong>Group Chat:</strong> Disappears after <strong>4 hours</strong> by default. 
                  If <strong>3 or more members</strong> agree to make it permanent, it unlocks forever.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 5: Whisper Space */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Ghost className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Whisper Space</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              Got something on your chest? The <strong>Whisper Space</strong> is your judgment-free zone. 
              Share your confessions, thoughts, or secrets anonymously. It&apos;s a safe place to let it all out 
              without fear of being known.
            </p>
          </div>

          {/* Section 6: Purpose */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 md:col-span-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 text-yellow-400">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Our Purpose</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              Social media can feel lonely. Vibess is built to fix that. We want to create a space where 
              <strong>emotions are valid</strong>, connection is genuine, and you never have to feel like 
              you&apos;re shouting into the void. Come as you are, feel what you feel.
            </p>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="text-center pt-8 pb-12">
          <button
            onClick={() => router.push('/vibe/create')}
            className="px-8 py-4 rounded-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/25 hover:-translate-y-1"
          >
            Start Vibing Now 🚀
          </button>
        </div>

      </div>
    </div>
  );
}
