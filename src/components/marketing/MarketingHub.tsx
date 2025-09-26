import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Megaphone, 
  Copy, 
  Hash, 
  Calendar,
  Image,
  Share2,
  Download,
  Eye,
  Edit,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';

const MarketingHub: React.FC = () => {
  const [contentType, setContentType] = useState('social-post');
  const [audienceType, setAudienceType] = useState('general');
  const [contentPrompt, setContentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const generateContent = async () => {
    setIsGenerating(true);
    
    // Simulate AI content generation
    setTimeout(() => {
      const content = [
        {
          id: 1,
          type: 'Facebook Post',
          content: `🎨 Discover the beauty of authentic Indian handicrafts! 

Our platform connects you directly with talented local artisans who pour their heart into every piece. From intricate pottery to stunning textiles, each item tells a story of tradition and craftsmanship.

✨ Why choose handmade?
• Support local communities
• Own unique, one-of-a-kind pieces  
• Preserve traditional art forms
• Fair prices for artisans

Shop authentic. Shop local. Shop with purpose.

#HandmadeCrafts #LocalArtisans #AuthenticIndia #SupportLocal #HandcraftedWithLove`,
          engagement: 'High',
          platform: 'Facebook'
        },
        {
          id: 2,
          type: 'Instagram Caption',
          content: `Behind every handcrafted piece is an artisan's story 👥✨

Meet Radha from Rajasthan, whose pottery has been passed down through generations. When you buy from our platform, you're not just getting beautiful ceramics - you're supporting a family tradition and helping preserve ancient techniques.

This is what authentic craftsmanship looks like 🏺

#MeetTheArtisan #HandmadePottery #RajasthaniCrafts #ArtisanStories #CraftBiz`,
          engagement: 'Very High',
          platform: 'Instagram'
        },
        {
          id: 3,
          type: 'LinkedIn Post',
          content: `The Indian handicrafts industry employs over 7 million artisans, yet most struggle to reach customers directly.

Our marketplace is changing that by:
📈 Eliminating middlemen who take 70% of profits
🤝 Providing direct customer access
📱 Offering digital tools for modern selling
🌍 Showcasing authentic Indian crafts globally

When technology meets tradition, everyone wins. Artisans earn fair wages, customers get authentic products, and cultural heritage thrives.

#SocialImpact #IndianHandicrafts #DigitalTransformation #Entrepreneurship`,
          engagement: 'Medium',
          platform: 'LinkedIn'
        }
      ];
      
      setGeneratedContent(content);
      setIsGenerating(false);
    }, 2500);
  };

  const handlePreviewContent = (content: any) => {
    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  };

  const handleEditContent = (content: any) => {
    setContentPrompt(content.content);
    setShowPreview(false);
  };

  const handleShareContent = (content: any) => {
    if (navigator.share) {
      navigator.share({
        title: `${content.type} Content`,
        text: content.content,
      });
    } else {
      handleCopyContent(content.content);
    }
  };

  const marketingTools = [
    {
      id: 'content',
      title: 'Content Generator',
      description: 'AI-powered social media posts and ad copy',
      icon: Copy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'hashtags',
      title: 'Hashtag Research',
      description: 'Trending hashtags for your niche',
      icon: Hash,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'scheduling',
      title: 'Best Times to Post',
      description: 'Optimal posting schedule analysis',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'visuals',
      title: 'Visual Assets',
      description: 'Marketing graphics and posters',
      icon: Image,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const schedulingData = {
    facebook: { bestTime: '1:00 PM - 3:00 PM', bestDays: ['Tuesday', 'Wednesday', 'Thursday'] },
    instagram: { bestTime: '11:00 AM - 1:00 PM', bestDays: ['Monday', 'Tuesday', 'Friday'] },
    linkedin: { bestTime: '8:00 AM - 10:00 AM', bestDays: ['Tuesday', 'Wednesday', 'Thursday'] },
    twitter: { bestTime: '9:00 AM - 10:00 AM', bestDays: ['Wednesday', 'Friday'] }
  };

  const hashtagSuggestions = [
    { tag: '#HandmadeCrafts', popularity: 'High', posts: '2.1M' },
    { tag: '#LocalArtisans', popularity: 'Medium', posts: '450K' },
    { tag: '#AuthenticIndia', popularity: 'Medium', posts: '320K' },
    { tag: '#SupportLocal', popularity: 'High', posts: '1.8M' },
    { tag: '#HandcraftedWithLove', popularity: 'Medium', posts: '680K' },
    { tag: '#IndianHandicrafts', popularity: 'Low', posts: '125K' },
    { tag: '#ArtisanMade', popularity: 'Medium', posts: '290K' },
    { tag: '#CraftBusiness', popularity: 'Low', posts: '85K' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Megaphone className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-foreground">Marketing Hub</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Create compelling marketing content and grow your audience
        </p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="visuals">Visuals</TabsTrigger>
        </TabsList>

        {/* Content Generation Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  AI Content Generator
                </CardTitle>
                <CardDescription>
                  Generate engaging social media posts and ad copy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                  >
                    <option value="social-post">Social Media Post</option>
                    <option value="ad-copy">Advertisement Copy</option>
                    <option value="email">Email Newsletter</option>
                    <option value="blog-intro">Blog Introduction</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <select 
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={audienceType}
                    onChange={(e) => setAudienceType(e.target.value)}
                  >
                    <option value="general">General Consumers</option>
                    <option value="millennials">Millennials (25-40)</option>
                    <option value="conscious">Conscious Consumers</option>
                    <option value="local">Local Community</option>
                    <option value="business">Business Owners</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Focus</label>
                  <Textarea
                    placeholder="What message do you want to convey? (e.g., supporting local artisans, product quality, cultural heritage)"
                    value={contentPrompt}
                    onChange={(e) => setContentPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <Button 
                  variant="craft" 
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Megaphone className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Tools Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Marketing Tools</CardTitle>
                <CardDescription>
                  Comprehensive tools for your marketing success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketingTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div key={tool.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-smooth">
                        <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                          <Icon className={`h-5 w-5 ${tool.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{tool.title}</h4>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Content */}
          {generatedContent.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Review, edit, and use your AI-generated marketing content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedContent.map((content) => (
                    <div key={content.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{content.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            content.engagement === 'High' ? 'bg-green-100 text-green-700' :
                            content.engagement === 'Very High' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {content.engagement} Engagement
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditContent(content)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleCopyContent(content.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleShareContent(content)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                        {content.content}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Hashtags Tab */}
        <TabsContent value="hashtags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Hashtag Research
              </CardTitle>
              <CardDescription>
                Trending hashtags for your niche and industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hashtagSuggestions.map((hashtag, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:shadow-soft transition-smooth">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{hashtag.tag}</span>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>{hashtag.posts} posts</div>
                      <div className={`mt-1 ${
                        hashtag.popularity === 'High' ? 'text-green-600' :
                        hashtag.popularity === 'Medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {hashtag.popularity} popularity
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Optimal Posting Schedule
              </CardTitle>
              <CardDescription>
                Best times to post for maximum engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(schedulingData).map(([platform, data]) => (
                  <div key={platform} className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold capitalize mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent-orange" />
                      {platform}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Time:</span>
                        <span className="font-medium">{data.bestTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Days:</span>
                        <span className="font-medium">{data.bestDays.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visuals Tab */}
        <TabsContent value="visuals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Visual Marketing Assets
              </CardTitle>
              <CardDescription>
                Create stunning visuals for your marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Visual Assets Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Generate marketing posters, social media graphics, and promotional materials
              </p>
              <Button 
                variant="warm"
                onClick={() => {
                  if (generatedContent.length > 0) {
                    handlePreviewContent(generatedContent[0]);
                  } else {
                    alert('Generate some content first to see the preview feature!');
                  }
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview Feature
              </Button>
              
              {/* Preview Modal */}
              {showPreview && previewContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Content Preview</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowPreview(false)}
                      >
                        ×
                      </Button>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{previewContent.type}</span>
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {previewContent.platform}
                        </span>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="whitespace-pre-line text-sm">
                          {previewContent.content}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => handleCopyContent(previewContent.content)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        variant="craft"
                        onClick={() => handleShareContent(previewContent)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingHub;