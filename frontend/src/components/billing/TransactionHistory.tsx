'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface Transaction {
    id: number;
    type: 'earn' | 'spend' | 'purchase' | 'refund';
    amount: number;
    description: string;
    createdAt: string;
    relatedTo?: string;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
    className?: string;
}

type FilterType = 'all' | 'earn' | 'spend' | 'purchase' | 'refund';
type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export function TransactionHistory({ transactions, className }: TransactionHistoryProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        // Filter by type
        if (filter !== 'all') {
            result = result.filter((t) => t.type === filter);
        }

        // Filter by search query
        if (searchQuery) {
            result = result.filter((t) =>
                t.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;

            if (sortField === 'date') {
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else {
                comparison = a.amount - b.amount;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [transactions, filter, sortField, sortOrder, searchQuery]);

    const stats = useMemo(() => {
        const earned = transactions
            .filter((t) => t.type === 'earn' || t.type === 'purchase')
            .reduce((sum, t) => sum + t.amount, 0);

        const spent = transactions
            .filter((t) => t.type === 'spend')
            .reduce((sum, t) => sum + t.amount, 0);

        return { earned, spent, total: earned - spent };
    }, [transactions]);

    const getTypeInfo = (type: Transaction['type']) => {
        switch (type) {
            case 'earn':
                return { label: 'Kazanıldı', color: 'text-green-400', bg: 'bg-green-500/20', icon: '💰' };
            case 'spend':
                return { label: 'Harcandı', color: 'text-red-400', bg: 'bg-red-500/20', icon: '💸' };
            case 'purchase':
                return { label: 'Satın Alındı', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '🛒' };
            case 'refund':
                return { label: 'İade', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '↩️' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const exportToCSV = () => {
        const headers = ['Tarih', 'Tip', 'Miktar', 'Açıklama'];
        const rows = filteredAndSortedTransactions.map((t) => [
            formatDate(t.createdAt),
            getTypeInfo(t.type).label,
            t.amount,
            t.description,
        ]);

        const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-300">Toplam Kazanç</p>
                            <p className="text-2xl font-bold text-green-400">+{stats.earned}</p>
                        </div>
                        <div className="text-3xl">💰</div>
                    </div>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-red-300">Toplam Harcama</p>
                            <p className="text-2xl font-bold text-red-400">-{stats.spent}</p>
                        </div>
                        <div className="text-3xl">💸</div>
                    </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-primary">Net Bakiye</p>
                            <p className="text-2xl font-bold text-primary">{stats.total}</p>
                        </div>
                        <div className="text-3xl">📊</div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="İşlem ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white placeholder-textMuted outline-none focus:border-primary transition-colors"
                    />
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {(['all', 'earn', 'spend', 'purchase', 'refund'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                filter === f
                                    ? 'bg-primary text-black'
                                    : 'bg-surface border border-border text-textMuted hover:border-primary'
                            )}
                        >
                            {f === 'all' ? 'Tümü' : getTypeInfo(f as Exclude<FilterType, 'all'>).label}
                        </button>
                    ))}
                </div>

                {/* Export */}
                <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                    📥 CSV İndir
                </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4 text-sm">
                <span className="text-textMuted">Sırala:</span>
                <button
                    onClick={() => {
                        if (sortField === 'date') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                            setSortField('date');
                            setSortOrder('desc');
                        }
                    }}
                    className={cn(
                        'px-3 py-1 rounded-lg transition-colors',
                        sortField === 'date'
                            ? 'bg-primary text-black'
                            : 'bg-surface text-textMuted hover:text-white'
                    )}
                >
                    Tarih {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                    onClick={() => {
                        if (sortField === 'amount') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                            setSortField('amount');
                            setSortOrder('desc');
                        }
                    }}
                    className={cn(
                        'px-3 py-1 rounded-lg transition-colors',
                        sortField === 'amount'
                            ? 'bg-primary text-black'
                            : 'bg-surface text-textMuted hover:text-white'
                    )}
                >
                    Miktar {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
                {filteredAndSortedTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📭</div>
                        <div className="text-xl font-semibold mb-2">İşlem Bulunamadı</div>
                        <div className="text-textMuted">
                            {searchQuery ? 'Arama kriterlerinize uygun işlem yok' : 'Henüz işlem yapılmamış'}
                        </div>
                    </div>
                ) : (
                    filteredAndSortedTransactions.map((transaction) => {
                        const typeInfo = getTypeInfo(transaction.type);
                        const isPositive = transaction.type === 'earn' || transaction.type === 'purchase' || transaction.type === 'refund';

                        return (
                            <div
                                key={transaction.id}
                                className="p-4 bg-surface border border-border rounded-lg hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={cn('p-2 rounded-lg', typeInfo.bg)}>
                                            <span className="text-xl">{typeInfo.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn('text-xs font-medium px-2 py-0.5 rounded', typeInfo.bg, typeInfo.color)}>
                                                    {typeInfo.label}
                                                </span>
                                                {transaction.relatedTo && (
                                                    <span className="text-xs text-textMuted">• {transaction.relatedTo}</span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium">{transaction.description}</p>
                                            <p className="text-xs text-textMuted mt-1">{formatDate(transaction.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className={cn('text-xl font-bold', typeInfo.color)}>
                                        {isPositive ? '+' : '-'}{Math.abs(transaction.amount)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
