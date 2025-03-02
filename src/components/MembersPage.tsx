import * as React from "react";
import { useState, useEffect } from "react";
import { Member } from "../db/schema";
import { MemberCard } from "../components/MemberCard";

interface MembersPageProps {
  members?: Member[];
  initialPage?: number;
  initialPageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export function MembersPage({
  members = [],
  initialPage = 1,
  initialPageSize = 20,
  totalCount = 0,
  totalPages = 1,
}: MembersPageProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [membersData, setMembersData] = useState<Member[]>(members);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(totalPages);
  const [pageSize] = useState(initialPageSize);
  
  // Fetch members when page changes
  useEffect(() => {
    if (members.length === 0 || currentPage !== initialPage) {
      fetchMembers(currentPage);
    }
  }, [currentPage]);
  
  const fetchMembers = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/members?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();
      
      if (data.success) {
        setMembersData(data.data);
        setPageCount(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold">Members Directory</h1>
        <p className="text-xl text-muted-foreground">
          Browse our community members
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {membersData.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
          
          {pageCount > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center rounded-l-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                  // Show pages around current page
                  let pageNum = currentPage;
                  if (pageCount <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pageCount - 2) {
                    pageNum = pageCount - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`inline-flex items-center border border-border px-4 py-2 text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/70 text-primary-foreground hover:bg-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
                  disabled={currentPage === pageCount}
                  className="inline-flex items-center rounded-r-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 