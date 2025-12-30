import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Clock, Search, TrendingUp, Calendar, Filter } from 'lucide-react';

export default function History() {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockHistory = [
      {
        id: 1,
        query: "iPhone 15 Pro Max",
        timestamp: "2024-01-15T10:30:00",
        resultCount: 245,
        source: "TikTok",
        category: "Electronics"
      },
      {
        id: 2,
        query: "Gaming Laptops 2024",
        timestamp: "2024-01-14T14:45:00",
        resultCount: 189,
        source: "Shopee",
        category: "Computers"
      },
      {
        id: 3,
        query: "Wireless Earbuds",
        timestamp: "2024-01-13T09:15:00",
        resultCount: 312,
        source: "TikTok",
        category: "Audio"
      },
      {
        id: 4,
        query: "Smart Home Devices",
        timestamp: "2024-01-12T16:20:00",
        resultCount: 156,
        source: "Shopee",
        category: "Home"
      },
      {
        id: 5,
        query: "Fitness Trackers",
        timestamp: "2024-01-11T11:10:00",
        resultCount: 98,
        source: "TikTok",
        category: "Fitness"
      },
    ];

    setTimeout(() => {
      setSearchHistory(mockHistory);
      setLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = filter === 'all' 
    ? searchHistory 
    : searchHistory.filter(item => item.source.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Search History</h1>
            <p className="text-gray-400 mt-2">View and manage your past product searches</p>
          </div>
          <Button 
            onClick={() => {/* Clear history functionality */}} 
            variant="outline"
            className="border-gray-700 hover:bg-gray-900"
          >
            Clear All History
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600' : 'border-gray-700'}
          >
            <Filter className="w-4 h-4 mr-2" />
            All Searches
          </Button>
          <Button
            variant={filter === 'tiktok' ? 'default' : 'outline'}
            onClick={() => setFilter('tiktok')}
            className={filter === 'tiktok' ? 'bg-blue-600' : 'border-gray-700'}
          >
            TikTok
          </Button>
          <Button
            variant={filter === 'shopee' ? 'default' : 'outline'}
            onClick={() => setFilter('shopee')}
            className={filter === 'shopee' ? 'bg-blue-600' : 'border-gray-700'}
          >
            Shopee
          </Button>
        </div>

        {/* History List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHistory.length === 0 ? (
            <div className="col-span-2">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Search History</h3>
                  <p className="text-gray-400 mb-6">Your search history will appear here</p>
                  <Link to={createPageUrl("Home")}>
                    <Button>Start Searching</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <Card key={item.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-400" />
                        {item.query}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="border-gray-700">
                          {item.source}
                        </Badge>
                        <Badge variant="outline" className="border-gray-700">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(item.timestamp)}
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">Results:</span>
                      <span className="font-semibold text-white">{item.resultCount}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 border-gray-700 hover:bg-gray-800">
                      View Results
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                      Search Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        <Card className="mt-8 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Search Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-3xl font-bold text-white mb-2">{searchHistory.length}</div>
                <div className="text-gray-400">Total Searches</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.round(searchHistory.reduce((acc, item) => acc + item.resultCount, 0) / searchHistory.length)}
                </div>
                <div className="text-gray-400">Avg Results per Search</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-3xl font-bold text-white mb-2">
                  {searchHistory.filter(item => item.source === 'TikTok').length}
                </div>
                <div className="text-gray-400">TikTok Searches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
