"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: "",
    who: "",
    goal: "",
    health: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store form data in localStorage for the next page
    localStorage.setItem("userData", JSON.stringify(formData));
    // Navigate to vision board page
    router.push("/vision-board");
  };

  return (
    <div
      className="font-sans flex flex-col  
                    justify-between items-center 
                    min-h-screen
                     p-8 pb-0
                    bg-[url('/background.svg')] bg-cover bg-center
                    bg-no-repeat"
    >
      <main className="flex flex-col gap-[64px]  items-center">
        <div className="flex flex-col gap-[12px] items-center text-white">
          <h1 className="text-[64px]">Welcome to OnlyU</h1>
          <span className="text-2xl">Where Dreams meet Possibilities</span>
        </div>
        <div>
          <h3 className="text-white text-xl my-12 font-medium">
            Let&apos;s know you more (love animation)
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 space-y-12 border border-gray-300 rounded-lg shadow-lg p-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="flex gap-4 justify-center items-center">
                <span>I want to be a</span>
                <label
                  htmlFor="role"
                  className="sr-only block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  role
                </label>
                <div>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-6 justify-center items-center">
                <span>who</span>
                <label
                  htmlFor="who"
                  className="sr-only block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  who
                </label>
                <div>
                  <input
                    id="who"
                    name="who"
                    type="text"
                    value={formData.who}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <span className="mb-4 block">My personal goal is to</span>
              <label
                htmlFor="goal"
                className="sr-only block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                personal goal
              </label>
              <div>
                <input
                  id="goal"
                  name="goal"
                  type="text"
                  value={formData.goal}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Create My Vision Board
              </button>
            </div>
          </form>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
