import { useState } from 'react';
import { toast } from 'sonner';
import { revealApiKeyAction } from '@/app/api-key/reveal/action';
import { useApiKeys, useDeleteApiKeyMutation, useExportKeysMutation } from '@/hooks/use-api-keys';

export function useApiKeyTable(projectId: number) {
  const [revealingId, setRevealingId] = useState<number | null>(null);
  const [revealedValue, setRevealedValue] = useState<string | null>(null);
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<{ id: number; name: string } | null>(null);
  const [viewingPage, setViewingPage] = useState(1);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useApiKeys(projectId);

  const allKeys = data?.pages.flatMap(page => page.keys) || [];
  const loadedPagesCount = data?.pages.length || 0;
  const totalKeys = data?.pages[0]?.total || 0;

  const keysPerPage = 4;
  const totalPages = Math.ceil(totalKeys / keysPerPage) || 1;
  const startIndex = (viewingPage - 1) * keysPerPage;
  const currentPageKeys = allKeys.slice(startIndex, startIndex + keysPerPage);

  function handlePreviousPage() {
    if (viewingPage > 1) {
      setViewingPage(prev => prev - 1);
    }
  }

  function handleNextPage() {
    if (viewingPage < loadedPagesCount) {
      setViewingPage(prev => prev + 1);
    } else if (viewingPage < totalPages && hasNextPage) {
      fetchNextPage();
      setViewingPage(prev => prev + 1);
    }
  }

  const handleMouseEnterNext = () => {
    if (viewingPage === loadedPagesCount && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  async function handleReveal(id: number) {
    setRevealingId(id);
    try {
      const res = await revealApiKeyAction(id);
      if ('success' in res && res.success && res.data) {
        setRevealedValue(res.data);
        setIsRevealOpen(true);
      } else {
        const errMsg = 'error' in res ? res.error : 'Failed to decrypt key';
        toast.error(errMsg);
      }
    } catch {
      toast.error('Unexpected error during decryption');
    } finally {
      setRevealingId(null);
    }
  }

  const deleteMutation = useDeleteApiKeyMutation(projectId);
  const exportMutation = useExportKeysMutation();

  async function handleExport() {
    if (totalKeys === 0) return;
    const result = await exportMutation.mutateAsync(projectId);
    if (!('success' in result) || !result.success || !result.data) return;

    const envContent = result.data
      .map((entry) => `${entry.name}="${entry.value}"`)
      .join('\n');

    try {
      const win = window as unknown as {
        showSaveFilePicker?: (options?: {
          suggestedName?: string;
          types?: Array<{
            description: string;
            accept: Record<string, string[]>;
          }>;
        }) => Promise<{
          createWritable: () => Promise<{
            write: (content: string) => Promise<void>;
            close: () => Promise<void>;
          }>;
        }>;
      };
      if (!win.showSaveFilePicker) {
        throw new Error('FallbackToBlob');
      }
      const handle = await win.showSaveFilePicker({
        suggestedName: '.env',
        types: [{
          description: 'Environment File',
          accept: { 'text/plain': ['.env'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(envContent);
      await writable.close();
      toast.success('Downloaded .env file');
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') return;
      const blob = new Blob([envContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'keybase.env';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded keybase.env');
    }
  }

  async function handleDelete() {
    if (!deleteCandidate) return;
    deleteMutation.mutate(deleteCandidate.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
      }
    });
  }

  return {
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
  };
}
