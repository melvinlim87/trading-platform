import { Injectable, Logger } from '@nestjs/common';

/**
 * Portfolio Context Object - Token-efficient summary for AI consumption
 * Following CTO Architecture: All math done in TypeScript, not AI
 */
export interface PortfolioContextObject {
    meta: {
        user_name: string;
        risk_profile: 'Conservative' | 'Moderate' | 'Aggressive';
        cash_balance: number;
        total_positions: number;
    };
    performance: {
        total_equity: number;
        daily_pnl_usd: number;
        daily_pnl_pct: string;
        total_pnl_usd: number;
        total_pnl_pct: string;
        status: 'PROFITABLE' | 'IN DRAWDOWN' | 'BREAK EVEN';
    };
    drivers: {
        biggest_winner: string;
        biggest_winner_pnl: string;
        biggest_loser: string;
        biggest_loser_pnl: string;
    };
    allocation: Record<string, string>;
    warnings: string[];
}

export interface RawPosition {
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    assetClass: string;
    positionType?: string;
    leverage?: number;
}

@Injectable()
export class PortfolioAggregatorService {
    private readonly logger = new Logger(PortfolioAggregatorService.name);

    /**
     * Generates a compressed JSON summary of the user's financial state.
     * This is the "Context Injection" pattern - all calculations done here, not by AI.
     */
    getContext(
        positions: RawPosition[],
        userName: string = 'Trader',
        riskProfile: 'Conservative' | 'Moderate' | 'Aggressive' = 'Moderate',
        cashBalance: number = 0
    ): PortfolioContextObject {
        this.logger.log(`Aggregating context for ${positions.length} positions`);

        // 1. Calculate Portfolio Totals
        const positionsWithCalcs = positions.map(pos => {
            const leverage = pos.leverage || 1;
            const currentValue = pos.quantity * pos.currentPrice * leverage;
            const costBasis = pos.quantity * pos.avgPrice * leverage;
            const pnl = currentValue - costBasis;
            const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

            // Simulate daily P&L (in real app, would track from yesterday's close)
            const dailyPnl = pnl * 0.15; // Demo: ~15% of total P&L as daily
            const dailyPnlPct = currentValue > 0 ? (dailyPnl / currentValue) * 100 : 0;

            return {
                ...pos,
                currentValue,
                costBasis,
                pnl,
                pnlPct,
                dailyPnl,
                dailyPnlPct
            };
        });

        const totalEquity = positionsWithCalcs.reduce((sum, p) => sum + p.currentValue, 0);
        const totalCostBasis = positionsWithCalcs.reduce((sum, p) => sum + p.costBasis, 0);
        const totalPnL = positionsWithCalcs.reduce((sum, p) => sum + p.pnl, 0);
        const dailyPnL = positionsWithCalcs.reduce((sum, p) => sum + p.dailyPnl, 0);

        const totalPnLPct = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;
        const dailyPnLPct = totalEquity > 0 ? (dailyPnL / totalEquity) * 100 : 0;

        // 2. Identify "Movers" - Why is the user happy/sad?
        const sortedByPnL = [...positionsWithCalcs].sort((a, b) => b.pnl - a.pnl);
        const topWinner = sortedByPnL[0];
        const topLoser = sortedByPnL[sortedByPnL.length - 1];

        // 3. Calculate Allocation by Asset Class
        const allocationMap: Record<string, number> = {};
        for (const pos of positionsWithCalcs) {
            const assetClass = pos.assetClass.toUpperCase();
            allocationMap[assetClass] = (allocationMap[assetClass] || 0) + pos.currentValue;
        }

        const allocation: Record<string, string> = {};
        for (const [assetClass, value] of Object.entries(allocationMap)) {
            const pct = totalEquity > 0 ? (value / totalEquity) * 100 : 0;
            allocation[assetClass] = `${pct.toFixed(1)}%`;
        }

        // 4. Generate Risk Flags
        const warnings = this.getRiskFlags(dailyPnLPct, cashBalance, allocation);

        // 5. Determine Status
        let status: 'PROFITABLE' | 'IN DRAWDOWN' | 'BREAK EVEN';
        if (dailyPnL > 10) status = 'PROFITABLE';
        else if (dailyPnL < -10) status = 'IN DRAWDOWN';
        else status = 'BREAK EVEN';

        const context: PortfolioContextObject = {
            meta: {
                user_name: userName,
                risk_profile: riskProfile,
                cash_balance: cashBalance,
                total_positions: positions.length
            },
            performance: {
                total_equity: Math.round(totalEquity * 100) / 100,
                daily_pnl_usd: Math.round(dailyPnL * 100) / 100,
                daily_pnl_pct: `${dailyPnLPct >= 0 ? '+' : ''}${dailyPnLPct.toFixed(2)}%`,
                total_pnl_usd: Math.round(totalPnL * 100) / 100,
                total_pnl_pct: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%`,
                status
            },
            drivers: {
                biggest_winner: topWinner && topWinner.pnl > 0
                    ? `${topWinner.symbol} (${topWinner.name})`
                    : 'None',
                biggest_winner_pnl: topWinner && topWinner.pnl > 0
                    ? `+$${topWinner.pnl.toFixed(2)} (+${topWinner.pnlPct.toFixed(2)}%)`
                    : '$0',
                biggest_loser: topLoser && topLoser.pnl < 0
                    ? `${topLoser.symbol} (${topLoser.name})`
                    : 'None',
                biggest_loser_pnl: topLoser && topLoser.pnl < 0
                    ? `-$${Math.abs(topLoser.pnl).toFixed(2)} (${topLoser.pnlPct.toFixed(2)}%)`
                    : '$0'
            },
            allocation,
            warnings
        };

        this.logger.log(`Context aggregated: equity=$${totalEquity.toFixed(2)}, daily=${status}`);
        return context;
    }

    private getRiskFlags(
        dailyDrawdownPct: number,
        cashBalance: number,
        allocation: Record<string, string>
    ): string[] {
        const flags: string[] = [];

        // Daily loss limit check
        if (dailyDrawdownPct < -5) {
            flags.push(`⚠️ User exceeded 5% daily loss limit (currently ${dailyDrawdownPct.toFixed(2)}%).`);
        }

        // Liquidity check
        if (cashBalance < 100) {
            flags.push(`💰 Low liquidity: Cash balance is only $${cashBalance.toFixed(2)}. Cannot make new purchases without deposit or selling.`);
        }

        // Concentration check
        for (const [assetClass, pctStr] of Object.entries(allocation)) {
            const pct = parseFloat(pctStr);
            if (pct > 70) {
                flags.push(`📊 High concentration: ${pct.toFixed(1)}% allocated to ${assetClass}. Consider diversifying.`);
            }
        }

        return flags;
    }
}
