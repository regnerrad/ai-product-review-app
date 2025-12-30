import React, { useState, useEffect } from "react";
import { useAuth } from "../components/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Trash2, Edit, Plus, ExternalLink, TrendingUp, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import BulkUpload from "../components/affiliate/BulkUpload";
import { findAffiliateLinkByBrandModel, createAffiliateLinkInSupabase } from "../services/affiliateService";
import { getProductSearchesFromSupabase } from "../services/productSearchService";

export default function ManageAffiliate() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    original_url: "",
    affiliate_url: "",
    price: "",
    availability: "In Stock",
  });

  useEffect(() => {
    fetchAffiliateLinks();
    fetchPopularSearches();
  }, []);

  const fetchAffiliateLinks = async () => {
    // Implementation would go here
  };

  const fetchPopularSearches = async () => {
    try {
      const searches = await getProductSearchesFromSupabase();
      setPopularSearches(searches);
    } catch (error) {
      console.error("Error fetching popular searches:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implementation would go here
  };

  const handleDelete = async (id) => {
    // Implementation would go here
  };

  const handleEdit = (link) => {
    // Implementation would go here
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Affiliate Links</h1>
            <p className="text-gray-400 mt-2">Add and manage your affiliate links for popular products</p>
          </div>
          <Button onClick={() => navigate(createPageUrl("Home"))} variant="outline">
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Your Affiliate Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {affiliateLinks.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No affiliate links yet. Add your first one!</p>
                  ) : (
                    affiliateLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{link.brand} {link.model}</h3>
                          <p className="text-sm text-gray-400">Price: ${link.price}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(link)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(link.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Add New Link</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g., Apple, Samsung"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="e.g., iPhone 15 Pro, Galaxy S24"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Affiliate Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Popular Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {popularSearches.slice(0, 5).map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded">
                      <span>{search.query}</span>
                      <Badge variant="outline">{search.count} searches</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
