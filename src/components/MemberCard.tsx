import * as React from "react";
import { useState } from "react";
import { Member } from "../db/schema";

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Generate a placeholder image using the first letter of first and last name
  const getInitials = () => {
    const first = member.firstName?.charAt(0) || "";
    const last = member.lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };
  
  // Format the graduation year or school info for display
  const getSchoolInfo = () => {
    if (member.graduationYear) {
      return `Class of ${member.graduationYear}`;
    }
    return member.school || "Alumni";
  };
  
  return (
    <>
      {/* Member Card */}
      <div 
        className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex flex-col items-center p-4">
          {/* Member image placeholder */}
          <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-secondary text-4xl font-bold text-card-foreground">
            {getInitials()}
          </div>
          
          <h3 className="text-center text-xl font-semibold">
            {member.firstName} {member.lastName}
            {member.marriedName && ` (${member.marriedName})`}
          </h3>
          
          <p className="mb-1 text-center text-sm text-muted-foreground">
            {getSchoolInfo()}
          </p>
          
          {member.city && member.state && (
            <p className="text-center text-sm text-muted-foreground">
              {member.city}, {member.state}
            </p>
          )}
          
          <button 
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            View Details
          </button>
        </div>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-lg border border-border bg-card p-6 shadow-lg">
            <button
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Left column with image */}
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-secondary text-5xl font-bold text-card-foreground">
                  {getInitials()}
                </div>
                <h2 className="text-center text-2xl font-bold">
                  {member.firstName} {member.lastName}
                  {member.marriedName && <div className="text-lg font-normal">({member.marriedName})</div>}
                </h2>
                <p className="text-center text-muted-foreground">{getSchoolInfo()}</p>
              </div>
              
              {/* Right column with details */}
              <div className="col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="mt-2 space-y-2">
                    {(member.address1 || member.city || member.state) && (
                      <p>
                        {member.address1 && <span className="block">{member.address1}</span>}
                        {member.address2 && <span className="block">{member.address2}</span>}
                        {member.city && member.state && (
                          <span>
                            {member.city}, {member.state} {member.zipCode}
                          </span>
                        )}
                        {member.country && member.country !== "USA" && (
                          <span className="block">{member.country}</span>
                        )}
                      </p>
                    )}
                    
                    {member.email1 && (
                      <p>
                        <span className="font-medium">Email:</span> {member.email1}
                      </p>
                    )}
                    
                    {member.homePhone && (
                      <p>
                        <span className="font-medium">Phone:</span> {member.homePhone}
                      </p>
                    )}
                  </div>
                </div>
                
                {(member.gradesAttended || member.datesAttended) && (
                  <div>
                    <h3 className="text-lg font-semibold">School Information</h3>
                    <div className="mt-2 space-y-2">
                      {member.school && (
                        <p>
                          <span className="font-medium">School:</span> {member.school}
                        </p>
                      )}
                      
                      {member.gradesAttended && (
                        <p>
                          <span className="font-medium">Grades Attended:</span> {member.gradesAttended}
                        </p>
                      )}
                      
                      {member.datesAttended && (
                        <p>
                          <span className="font-medium">Dates Attended:</span> {member.datesAttended}
                        </p>
                      )}
                      
                      {member.graduationYear && (
                        <p>
                          <span className="font-medium">Graduation Year:</span> {member.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {member.memberBio && (
                  <div>
                    <h3 className="text-lg font-semibold">Biography</h3>
                    <p className="mt-2 whitespace-pre-wrap">{member.memberBio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 