import * as React from 'react';
import { Layout } from './Layout';
import { Directory } from '../db/schema';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DirectoryCardProps {
  directory: Directory;
}

// Component for displaying individual directory entries
const DirectoryCard: React.FC<DirectoryCardProps> = ({ directory }) => {
  // Generate unique ID for modal
  const modalId = `directory-modal-${directory.id}`;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{directory.name}</CardTitle>
          {directory.category && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {directory.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-2">
        {directory.organization && (
          <div className="mb-2">
            <span className="font-medium text-sm">Organization:</span> 
            <span className="text-sm">{directory.organization}</span>
          </div>
        )}
        
        {directory.position && (
          <div className="mb-2">
            <span className="font-medium text-sm">Position:</span> 
            <span className="text-sm text-muted-foreground">{directory.position}</span>
          </div>
        )}
        
        {(directory.address || directory.city || directory.state || directory.zipCode) && (
          <div className="mt-2">
            <h4 className="text-xs font-semibold mb-1">Address</h4>
            <address className="not-italic text-xs text-muted-foreground">
              {directory.address && <div>{directory.address}</div>}
              {(directory.city || directory.state || directory.zipCode) && (
                <div>
                  {directory.city}{directory.city && directory.state ? ", " : ""}
                  {directory.state} {directory.zipCode}
                </div>
              )}
              {directory.country && <div>{directory.country}</div>}
            </address>
          </div>
        )}
        
        <div className="w-full pt-2 border-t border-border mt-auto">
          <div className="flex flex-wrap gap-3 mb-2">
            {directory.email && (
              <a href={`mailto:${directory.email}`} className="flex items-center text-xs text-primary hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {directory.email}
              </a>
            )}
            
            {directory.website && (
              <a href={directory.website.startsWith('http') ? directory.website : `https://${directory.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-xs text-primary hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Website
              </a>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        {(directory.description || directory.notes) && (
          <Button 
            variant="default" 
            className="w-full text-sm text-primary-foreground"
            data-modal-toggle={modalId}
          >
            View Details
          </Button>
        )}
      </CardFooter>
      
      {/* Modal for directory details - using correct class name for modal.js */}
      <div id={modalId} className="modal-container hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <div className="relative h-[33vh] w-full max-w-4xl rounded-lg bg-background shadow-lg flex flex-col">
          <div className="modal-header border-b border-border p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">{directory.name}</h2>
            <button
              className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 modal-close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="modal-body p-4 overflow-y-auto flex-grow">
            <div className="space-y-4">
              {directory.organization && (
                <div>
                  <h3 className="text-sm font-semibold">Organization</h3>
                  <p className="text-sm">{directory.organization}</p>
                </div>
              )}
              
              {directory.department && (
                <div>
                  <h3 className="text-sm font-semibold">Department</h3>
                  <p className="text-sm">{directory.department}</p>
                </div>
              )}
              
              {directory.position && (
                <div>
                  <h3 className="text-sm font-semibold">Position</h3>
                  <p className="text-sm">{directory.position}</p>
                </div>
              )}
              
              {(directory.address || directory.city || directory.state || directory.zipCode) && (
                <div>
                  <h3 className="text-sm font-semibold">Address</h3>
                  <address className="not-italic text-sm">
                    {directory.address && <div>{directory.address}</div>}
                    {(directory.city || directory.state || directory.zipCode) && (
                      <div>
                        {directory.city}{directory.city && directory.state ? ", " : ""}
                        {directory.state} {directory.zipCode}
                      </div>
                    )}
                    {directory.country && <div>{directory.country}</div>}
                  </address>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-semibold">Contact Information</h3>
                <ul className="list-none pl-0 text-sm">
                  {directory.phone && (
                    <li className="my-1">Phone: {directory.phone}</li>
                  )}
                  {directory.email && (
                    <li className="my-1">Email: {directory.email}</li>
                  )}
                  {directory.website && (
                    <li className="my-1">
                      Website: <a href={directory.website.startsWith('http') ? directory.website : `https://${directory.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline">
                        {directory.website}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              
              {directory.description && (
                <div>
                  <h3 className="text-sm font-semibold">Description</h3>
                  <p className="whitespace-pre-line text-sm">{directory.description}</p>
                </div>
              )}
              
              {directory.notes && (
                <div>
                  <h3 className="text-sm font-semibold">Notes</h3>
                  <p className="whitespace-pre-line text-sm">{directory.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// DirectoryList component to display directory entries in a grid
const DirectoryList: React.FC<{ 
  directories: Directory[],
  loading?: boolean,
  searchTerm?: string
}> = ({ directories, loading = false, searchTerm = '' }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="h-full animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (directories.length === 0) {
    return (
      <div className="text-center py-12">
        {searchTerm ? (
          <div>
            <p className="text-xl text-muted-foreground">No results found for "{searchTerm}"</p>
            <p className="text-muted-foreground mt-2">Try a different search term or clear your search</p>
          </div>
        ) : (
          <p className="text-xl text-muted-foreground">No directory entries found</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {directories.map(directory => (
        <DirectoryCard key={directory.id} directory={directory} />
      ))}
    </div>
  );
};

// DirectoryFilter component for searching and filtering
const DirectoryFilter: React.FC<{
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearching?: boolean;
  resultsCount?: number;
  totalCount?: number;
}> = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  searchTerm, 
  setSearchTerm,
  isSearching = false,
  resultsCount = 0,
  totalCount = 0
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              id="search"
              className="w-full px-4 py-2 rounded-md border border-input bg-background"
              placeholder="Search by name, position, email, organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className={`absolute right-3 top-2 ${isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
          {searchTerm && !isSearching && (
            <div className="mt-1 text-xs text-muted-foreground">
              Showing {resultsCount} out of {totalCount} entries
            </div>
          )}
        </div>
        
        <div className="md:w-1/3">
          <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
          <select
            id="category"
            className="w-full px-4 py-2 rounded-md border border-input bg-background"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Pagination component for directory listing
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxDisplayed = 5; // Maximum number of page buttons to show

    if (totalPages <= maxDisplayed) {
      // If we have 5 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      // Calculate the start and end of the current window
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust window to always show 3 pages when possible
      if (currentPage <= 3) {
        // Near the start
        end = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis after page 1 if necessary
      if (start > 2) {
        pages.push('...');
      }

      // Add the window of page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before the last page if necessary
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always include the last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  
  // Button click handlers
  const handlePrevClick = () => {
    console.log("Previous button clicked");
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNextClick = () => {
    console.log("Next button clicked");
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const handlePageClick = (page: number | string) => {
    console.log(`Page ${page} clicked`);
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
        {/* Previous button */}
        <button
          type="button"
          onClick={handlePrevClick}
          disabled={currentPage === 1}
          className="inline-flex items-center rounded-l-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Previous
        </button>
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="inline-flex items-center border border-border px-3 py-2 text-sm font-medium">
              ...
            </span>
          ) : (
            <button
              type="button"
              key={`page-${page}`}
              onClick={() => handlePageClick(page)}
              className={`inline-flex items-center border border-border px-4 py-2 text-sm font-medium ${
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        {/* Next button */}
        <button
          type="button"
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
          className="inline-flex items-center rounded-r-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

// Main DirectoryPage component
export const DirectoryPage: React.FC<{
  directories: Directory[];
  categories: string[];
  initialPage?: number;
  initialPageSize?: number;
  totalCount?: number;
  totalPages?: number;
}> = ({ 
  directories, 
  categories, 
  initialPage = 1, 
  initialPageSize = 9, 
  totalCount = 0, 
  totalPages = 1 
}) => {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  
  const [directoryData, setDirectoryData] = useState({
    directories: directories,
    totalPages: totalPages,
    totalCount: totalCount
  });

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Reset to page 1 when search changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Set a new timeout to update search after 300ms
    window.searchTimeout = setTimeout(() => {
      setDebouncedSearchTerm(value);
      fetchDirectories(1, selectedCategory, value);
    }, 300);
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchDirectories(1, category, searchTerm);
  };

  // Initialize with data on first render
  useEffect(() => {
    // Only fetch on initial render if we don't have directories
    if (directories.length === 0) {
      fetchDirectories(currentPage, selectedCategory, searchTerm);
    }
    
    // Add searchTimeout to window object for cleanup
    window.searchTimeout = null;
    
    // Cleanup
    return () => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
    };
  }, []);
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page === currentPage) {
      console.log(`Already on page ${page}, ignoring click`);
      return;
    }
    
    console.log(`Changing to page ${page} from ${currentPage}`);
    setCurrentPage(page);
    
    // Force immediate fetch - using a direct URL call to see in network tab
    const url = new URL('/api/directories', window.location.origin);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', initialPageSize.toString());
    
    if (selectedCategory) {
      url.searchParams.append('category', selectedCategory);
    }
    
    if (searchTerm) {
      url.searchParams.append('search', searchTerm);
    }
    
    console.log(`Fetching: ${url.toString()}`);
    
    // Use fetch directly to ensure network request happens
    fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Fetch successful, got ${data.data.length} results for page ${page}`);
      setDirectoryData({
        directories: data.data,
        totalPages: data.pagination.totalPages,
        totalCount: data.pagination.totalCount
      });
      setIsLoading(false);
    })
    .catch(error => {
      console.error("Error fetching page data:", error);
      setIsLoading(false);
    });
    
    // Set loading state while fetch is happening
    setIsLoading(true);
    
    // Scroll to top of the directory section
    window.scrollTo({
      top: document.getElementById('directory-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Function to fetch directory data with pagination and filters
  const fetchDirectories = async (page: number, category: string, search: string) => {
    setIsLoading(true);
    
    try {
      let url = `/api/directories?page=${page}&pageSize=${initialPageSize}`;
      
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      console.log(`Fetching directories with URL: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch directories: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.data.length} results out of ${data.pagination.totalCount} total`);
      
      // Display the actual results for debugging
      if (search) {
        console.log("Search results:", data.data.map(dir => dir.name));
      }
      
      setDirectoryData({
        directories: data.data,
        totalPages: data.pagination.totalPages,
        totalCount: data.pagination.totalCount
      });
    } catch (error) {
      console.error("Error fetching directories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nouasseur Directory</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Browse our directory of resources, businesses, and services related to the Nouasseur community.
        </p>
      </div>
      
      <section id="directory-section">
        {/* Search and filter components */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  className="w-full px-4 py-2 rounded-md border border-input bg-background"
                  placeholder="Search by name, position, email, organization..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <span className={`absolute right-3 top-2 ${isLoading ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
              </div>
              {searchTerm && !isLoading && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Showing {directoryData.directories.length} out of {directoryData.totalCount} entries
                </div>
              )}
            </div>
            
            <div className="md:w-1/3">
              <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
              <select
                id="category"
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Directory listing */}
        <DirectoryList 
          directories={directoryData.directories} 
          loading={isLoading}
          searchTerm={searchTerm} 
        />
        
        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={directoryData.totalPages}
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
};

// Adding typings
declare global {
  interface Window {
    searchTimeout: any;
  }
} 