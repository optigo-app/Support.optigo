'use client';
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

// Standard fallback query card items if data is loading or initializing
const DEFAULT_QUERY_CARDS = [
  {
    id: 'q-1',
    badge: '1d',
    personName: 'Aesha Limbasiya',
    companyTag: 'Deglint',
    companyCode: 'deglint',
    topicSnippet: 'deglint • MEMO INVOICE PR...',
    timeAgo: '1 day ago',
    threadId: 'call-1',
  },
  {
    id: 'q-2',
    badge: '1d',
    personName: 'Aesha Limbasiya',
    companyTag: 'Deglint',
    companyCode: 'deglint',
    topicSnippet: 'deglint • MEMO NA PRINT S...',
    timeAgo: '1 day ago',
    threadId: 'call-2',
  },
  {
    id: 'q-3',
    badge: '2d',
    personName: 'Deepak Kirdat',
    companyTag: 'Shree',
    companyCode: 'shree',
    topicSnippet: 'shree • Please call bac...',
    timeAgo: '3 days ago',
    threadId: 'call-3',
  },
  {
    id: 'q-4',
    badge: '4d',
    personName: 'Jagruti Gadhiya',
    companyTag: 'Kayra',
    companyCode: 'kayra',
    topicSnippet: 'kayra • Rushit sir plea...',
    timeAgo: '4 days ago',
    threadId: 'call-4',
  },
  {
    id: 'q-5',
    badge: '56m',
    personName: 'Divyesh Tailor',
    companyTag: 'Dcj',
    companyCode: 'dcj',
    topicSnippet: 'dcj • Bag issue Urge...',
    timeAgo: 'about 1 hour ago',
    threadId: 'call-5',
  },
];

export default function QuickQueryCardsRail({
  threads = [],
  activeThreadId,
  onSelectThread,
  selectedCompany = 'all',
}) {
  // Derive query cards from threads or use defaults
  const queryCards = React.useMemo(() => {
    if (!threads || threads.length === 0) return DEFAULT_QUERY_CARDS;

    // Filter by selected company if applicable
    let items = threads;
    if (selectedCompany && selectedCompany !== 'all') {
      items = threads.filter((t) => {
        const tComp = (t.company || t.name || '').toLowerCase();
        if (Array.isArray(selectedCompany)) {
          if (selectedCompany.length === 0) return true;
          return selectedCompany.some((c) => String(c).toLowerCase() === tComp);
        }
        return tComp === String(selectedCompany).toLowerCase();
      });
    }

    if (items.length === 0) return DEFAULT_QUERY_CARDS;

    return items.slice(0, 10).map((t, idx) => {
      const callBy = t.callBy || t.name || 'Client Contact';
      const company = t.company || 'Company';
      const topic = t.lastMessage || t.requirement || `${company.toLowerCase()} • Enquiry...`;
      
      // Calculate friendly badge
      let badge = '1d';
      if (t.time) {
        if (t.time.includes('m') || t.time.includes('min')) badge = t.time;
        else if (t.time.includes('h')) badge = t.time;
        else if (t.time.includes('d')) badge = t.time;
      } else {
        badge = `${(idx % 4) + 1}d`;
      }

      return {
        id: `card-${t.id || t.sr || idx}`,
        badge,
        personName: callBy,
        companyTag: company.charAt(0).toUpperCase() + company.slice(1),
        companyCode: company.toLowerCase(),
        topicSnippet: topic.length > 28 ? topic.substring(0, 25) + '...' : topic,
        timeAgo: t.formattedDate || `${badge} ago`,
        threadId: t.id,
        rawThread: t,
      };
    });
  }, [threads, selectedCompany]);

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#FAFAFA',
        borderBottom: '1px solid #E2E8F0',
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: 5 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 3 },
      }}
    >
      {queryCards.map((card) => {
        const isSelected = activeThreadId && card.threadId === activeThreadId;

        return (
          <Box
            key={card.id}
            onClick={() => onSelectThread && onSelectThread(card.threadId, card.rawThread)}
            sx={{
              minWidth: 235,
              maxWidth: 245,
              bgcolor: isSelected ? '#FEF2F2' : '#FFFFFF',
              border: isSelected ? '1.5px solid #EF4444' : '1px solid #F1F5F9',
              borderRadius: '6px',
              p: 1.2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease-in-out',
              userSelect: 'none',
              '&:hover': {
                boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                borderColor: '#FCA5A5',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {/* Red Elapsed Time Square Badge */}
            <Box
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(220,38,38,0.3)',
              }}
            >
              {card.badge}
            </Box>

            {/* Content info */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.2 }}>
              {/* Top row: Person Name + Company Tag */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{
                    fontWeight: 750,
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    lineHeight: 1.2,
                  }}
                >
                  {card.personName}
                </Typography>
                <Chip
                  label={card.companyTag}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    borderRadius: '4px',
                    px: 0.4,
                    '& .MuiChip-label': { px: 0.5 },
                  }}
                />
              </Box>

              {/* Topic snippet line */}
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: '#64748B',
                  fontSize: '0.73rem',
                  fontWeight: 500,
                }}
              >
                {card.topicSnippet}
              </Typography>

              {/* Time ago in red */}
              <Typography
                variant="caption"
                sx={{
                  color: '#DC2626',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  mt: 0.1,
                }}
              >
                {card.timeAgo}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
