'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApiKeyTable } from '@/features/api-keys/hooks/use-api-key-table';
import { ApiKeyTableHeader } from '@/features/api-keys/components/api-key-table-header';
import { ApiKeyRow } from '@/features/api-keys/components/api-key-row';
import { ApiKeyRevealDialog } from '@/features/api-keys/components/api-key-reveal-dialog';
import { ApiKeyDeleteDialog } from '@/features/api-keys/components/api-key-delete-dialog';

interface ApiKeyTableProps {
  projectId: number;
}

export function ApiKeyTable({ projectId }: ApiKeyTableProps) {
  const {
    revealingId,
    revealedValue,
    isRevealOpen,
    setIsRevealOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    deleteCandidate,
    setDeleteCandidate,
    viewingPage,
    totalPages,
    totalKeys,
    isLoading,
    error,
    currentPageKeys,
    isFetchingNextPage,
    deleteMutation,
    exportMutation,
    handlePreviousPage,
    handleNextPage,
    handleMouseEnterNext,
    handleReveal,
    handleExport,
    handleDelete,
  } = useApiKeyTable(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 text-destructive">
        Failed to load API keys
      </div>
    );
  }

  return (
    <>
      <Card className="border-border-light shadow-sm min-h-[200px] overflow-hidden">
        <ApiKeyTableHeader
          totalKeys={totalKeys}
          isPending={exportMutation.isPending}
          onExport={handleExport}
        />
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-forest/[0.02]">
              <TableRow className="hover:bg-transparent border-border-light">
                <TableHead className="w-full sm:w-[300px] font-heading font-semibold text-xs tracking-wide uppercase text-forest px-4 sm:px-6">
                  Identity
                </TableHead>
                <TableHead className="hidden sm:table-cell font-heading font-semibold text-xs tracking-wide uppercase text-forest">
                  Ownership
                </TableHead>
                <TableHead className="hidden sm:table-cell font-heading font-semibold text-xs tracking-wide uppercase text-forest">
                  Created
                </TableHead>
                <TableHead className="text-right px-4 sm:px-6 font-heading font-semibold text-xs tracking-wide uppercase text-forest">
                  Safety
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageKeys.length === 0 && isFetchingNextPage ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-forest/40 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : currentPageKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-medium italic">
                    The vault is currently empty.
                  </TableCell>
                </TableRow>
              ) : (
                currentPageKeys.map((key) => {
                  if (!key) return null;
                  return (
                    <ApiKeyRow
                      key={key.id}
                      apiKey={key}
                      revealingId={revealingId}
                      onReveal={handleReveal}
                      onDeleteClick={(candidate) => {
                        setDeleteCandidate(candidate);
                        setIsDeleteOpen(true);
                      }}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-border-light bg-forest/[0.01]">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-forest/40 hover:text-forest/60 hover:bg-bg-muted disabled:opacity-10 transition-colors"
                onClick={handlePreviousPage}
                disabled={viewingPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-xs font-medium text-forest/40 uppercase tracking-wider tabular-nums min-w-[6rem] text-center">
                Page {viewingPage} of {totalPages}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-forest/40 hover:text-forest/60 hover:bg-bg-muted disabled:opacity-10 transition-colors"
                onClick={handleNextPage}
                onMouseEnter={handleMouseEnterNext}
                disabled={viewingPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reveal Dialog */}
      <ApiKeyRevealDialog
        isOpen={isRevealOpen}
        onOpenChange={setIsRevealOpen}
        revealedValue={revealedValue}
      />

      {/* Delete Confirmation Dialog */}
      <ApiKeyDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        deleteCandidate={deleteCandidate}
        isPending={deleteMutation.isPending}
        onDelete={handleDelete}
      />
    </>
  );
}
