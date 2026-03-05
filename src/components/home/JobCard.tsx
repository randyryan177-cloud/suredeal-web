"use client";

import { MapPin, Briefcase, Banknote, Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";
export function JobPostCard({ companyName, companyLogo, jobTitle, description, location, jobType, salary, jobImage, initialLikes = 0 }: any) {
  return (
    <div className="bg-white border-b border-gray-100 p-4">
      <div className="flex items-center mb-3">
        <Image src={companyLogo} width={44} height={44} className="w-11 h-11 rounded-full object-cover" alt={companyName} />
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-bold text-gray-900">{companyName}</h4>
          <p className="text-xs text-gray-500">Posted 2h ago</p>
        </div>
        <button aria-label="job"><MoreHorizontal size={20} className="text-gray-400" /></button>
      </div>

      <div className="mb-3">
        <h3 className="text-lg font-extrabold text-gray-900 mb-1">{jobTitle}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            <MapPin size={14} /> {location}
          </span>
          <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
            <Banknote size={14} /> {salary}
          </span>
        </div>
      </div>

      {jobImage && <Image src={jobImage} width={400} height={224} className="w-full h-56 object-cover rounded-xl mb-3 bg-gray-50" alt="" />}

      <div className="flex justify-around border-t border-gray-50 pt-3">
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-500"><Heart size={20}/> Like</button>
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-500"><MessageSquare size={18}/> Comment</button>
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-500"><Share2 size={18}/> Share</button>
      </div>
    </div>
  );
}