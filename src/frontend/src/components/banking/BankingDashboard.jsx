import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  Card, 
  Row, 
  Col, 
  Badge, 
  Progress,
  Avatar,
  Text,
  Timeline
} from '@mantine/core';
import { 
  IconCurrencyDollar, 
  IconTrendingUp, 
  IconArrowUpRight,
  IconArrowDownRight,
  IconCreditCard,
  IconWallet,
  IconExchange,
  IconClock
} from '@tabler/icons-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import directusClient from '../../services/directus';
import './banking-glassmorphism.css';

const BankingDashboard = ({ company }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('CHF');
  const [exchangeRates] = useState({
    EUR: 1.08,
    USD: 0.92,
    GBP: 1.15
  });

  // Fetch bank accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery(
    ['bank-accounts', company],
    async () => {
      const response = await directusClient.items('bank_accounts').readByQuery({
        filter: { owner_company: { _eq: company } },
        sort: ['-balance']
      });
      return response.data || [];
    },
    { 
      enabled: !!company,
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  // Fetch recent transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery(
    ['bank-transactions', company],
    async () => {
      const response = await directusClient.items('bank_transactions').readByQuery({
        filter: { owner_company: { _eq: company } },
        sort: ['-date'],
        limit: 10
      });
      return response.data || [];
    },
    { 
      enabled: !!company,
      refetchInterval: 5000 // Refresh every 5 seconds for real-time feel
    }
  );

  // Calculate total balance in CHF
  const totalBalanceCHF = accounts.reduce((total, account) => {
    const rate = account.currency === 'CHF' ? 1 : (exchangeRates[account.currency] || 1);
    return total + (account.balance * rate);
  }, 0);

  // Calculate balance change
  const balanceChange = transactions
    .filter(tx => tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0) - 
    transactions
    .filter(tx => tx.type === 'debit')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const changePercentage = totalBalanceCHF > 0 ? (balanceChange / totalBalanceCHF * 100) : 0;

  if (accountsLoading || transactionsLoading) {
    return (
      <div className="banking-loading">
        <div className="pulse-loader" />
      </div>
    );
  }

  return (
    <div className="banking-dashboard">
      {/* Main Balance Card */}
      <Card className="glass-card balance-card">
        <div className="balance-display">
          <Text size="sm" color="dimmed" transform="uppercase">
            Solde Total
          </Text>
          <h1 className="balance-amount">
            {totalBalanceCHF.toLocaleString('fr-CH', {
              style: 'currency',
              currency: 'CHF'
            })}
          </h1>
          <div className="balance-change">
            <Badge 
              color={changePercentage >= 0 ? 'green' : 'red'} 
              variant="light"
              size="lg"
              radius="xl"
            >
              {changePercentage >= 0 ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />}
              {Math.abs(changePercentage).toFixed(2)}% ce mois
            </Badge>
          </div>
        </div>
      </Card>

      {/* Currency Cards */}
      <Row gutter="lg" mt="xl">
        {accounts.map((account) => (
          <Col key={account.id} span={12} md={4}>
            <Card 
              className={`glass-card currency-card ${selectedCurrency === account.currency ? 'active' : ''}`}
              onClick={() => setSelectedCurrency(account.currency)}
            >
              <div className="currency-icon">
                <IconWallet size={32} />
              </div>
              <Text size="xl" weight={700} mt="md">
                {account.currency}
              </Text>
              <Text size="lg" weight={600} color="blue">
                {account.balance.toLocaleString('fr-CH', {
                  style: 'currency',
                  currency: account.currency
                })}
              </Text>
              {account.currency !== 'CHF' && (
                <Text size="xs" color="dimmed" mt="xs">
                  1 {account.currency} = {exchangeRates[account.currency]} CHF
                </Text>
              )}
              <Progress 
                value={account.balance / 100000 * 100} 
                color="blue" 
                size="xs" 
                mt="md"
                radius="xl"
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Live Transactions */}
      <Card className="glass-card transactions-card" mt="xl">
        <div className="card-header">
          <h3>Transactions en temps réel</h3>
          <Badge color="green" variant="dot">Live</Badge>
        </div>
        
        <Timeline active={-1} bulletSize={24} lineWidth={2} mt="xl">
          {transactions.slice(0, 5).map((tx, index) => (
            <Timeline.Item
              key={tx.id}
              bullet={
                <Avatar size={24} radius="xl" color={tx.type === 'credit' ? 'green' : 'red'}>
                  {tx.type === 'credit' ? 
                    <IconArrowUpRight size={14} /> : 
                    <IconArrowDownRight size={14} />
                  }
                </Avatar>
              }
              className={`transaction-item ${index === 0 ? 'pulse' : ''}`}
            >
              <div className="transaction-content">
                <div className="transaction-info">
                  <Text weight={600}>{tx.description}</Text>
                  <Text size="sm" color="dimmed">
                    {tx.merchant_name || 'Transaction Revolut'} • 
                    {formatDistanceToNow(new Date(tx.date), { 
                      addSuffix: true,
                      locale: fr 
                    })}
                  </Text>
                </div>
                <div className={`transaction-amount ${tx.type}`}>
                  {tx.type === 'credit' ? '+' : '-'}
                  {Math.abs(tx.amount).toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: tx.currency || 'CHF'
                  })}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Quick Stats */}
      <Row gutter="lg" mt="xl">
        <Col span={12} md={3}>
          <Card className="glass-card stat-card">
            <IconCreditCard size={24} className="stat-icon" />
            <Text size="sm" color="dimmed">Dépenses du jour</Text>
            <Text size="xl" weight={700}>
              {transactions
                .filter(tx => tx.type === 'debit' && 
                  new Date(tx.date).toDateString() === new Date().toDateString()
                )
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
                .toLocaleString('fr-CH', {
                  style: 'currency',
                  currency: 'CHF'
                })
              }
            </Text>
          </Card>
        </Col>
        
        <Col span={12} md={3}>
          <Card className="glass-card stat-card">
            <IconTrendingUp size={24} className="stat-icon" />
            <Text size="sm" color="dimmed">Revenus du mois</Text>
            <Text size="xl" weight={700} color="green">
              {transactions
                .filter(tx => tx.type === 'credit')
                .reduce((sum, tx) => sum + tx.amount, 0)
                .toLocaleString('fr-CH', {
                  style: 'currency',
                  currency: 'CHF'
                })
              }
            </Text>
          </Card>
        </Col>
        
        <Col span={12} md={3}>
          <Card className="glass-card stat-card">
            <IconExchange size={24} className="stat-icon" />
            <Text size="sm" color="dimmed">Transactions</Text>
            <Text size="xl" weight={700}>
              {transactions.length}
            </Text>
          </Card>
        </Col>
        
        <Col span={12} md={3}>
          <Card className="glass-card stat-card">
            <IconClock size={24} className="stat-icon" />
            <Text size="sm" color="dimmed">Dernière sync</Text>
            <Text size="xl" weight={700}>
              {accounts[0]?.last_sync ? 
                formatDistanceToNow(new Date(accounts[0].last_sync), { 
                  locale: fr 
                }) : 
                'N/A'
              }
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BankingDashboard;