import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  Mic,
  TrendingUp,
  Zap,
  LogOut,
  Plus,
  BarChart3,
  Settings,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  getAdminStats,
  getLessonPerformance,
  addLesson,
  addSlide,
  getAllLessons,
  getLessonSlides,
  updateLessonXP,
  AdminStats,
  LessonPerformance,
  Lesson,
  Slide,
} from "@/lib/admin";
import { logout, isAdmin } from "@/lib/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [lessonPerformance, setLessonPerformance] = useState<LessonPerformance[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "content">("overview");

  // Content Management State
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [selectedLessonForSlide, setSelectedLessonForSlide] = useState("");
  const [newLesson, setNewLesson] = useState({
    lessonId: "",
    lessonNumber: 0,
    titleSanskrit: "",
    titleEnglish: "",
    difficultyLevel: "Beginner",
    description: "",
  });
  const [newSlide, setNewSlide] = useState({
    lessonSlideId: 0,
    orderIndex: 0,
    contentType: "Slide",
    sanskrit: "",
    word: "",
    transliteration: "",
    meaning: "",
    exampleMeaning: "",
  });

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      navigate("/admin/login");
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, performanceData, lessonsData] = await Promise.all([
        getAdminStats(),
        getLessonPerformance(),
        getAllLessons(),
      ]);
      setStats(statsData);
      setLessonPerformance(performanceData);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLesson(newLesson);
      alert("Lesson added successfully!");
      setShowAddLesson(false);
      setNewLesson({
        lessonId: "",
        lessonNumber: 0,
        titleSanskrit: "",
        titleEnglish: "",
        difficultyLevel: "Beginner",
        description: "",
      });
      loadDashboardData();
    } catch (error: any) {
      alert(error.message || "Failed to add lesson");
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonForSlide) {
      alert("Please select a lesson");
      return;
    }
    try {
      await addSlide(selectedLessonForSlide, newSlide);
      alert("Slide added successfully!");
      setShowAddSlide(false);
      setNewSlide({
        lessonSlideId: 0,
        orderIndex: 0,
        contentType: "Slide",
        sanskrit: "",
        word: "",
        transliteration: "",
        meaning: "",
        exampleMeaning: "",
      });
      setSelectedLessonForSlide("");
    } catch (error: any) {
      alert(error.message || "Failed to add slide");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary-dark sticky top-0 z-50 shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/login">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/30">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary-foreground font-display">Admin Dashboard</h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "performance"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "content"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Content Management
          </button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground mb-6 font-display">Overview Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-card border-0 shadow-card rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-card rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Lessons</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalLessons}</p>
                    </div>
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-card rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pronunciation Attempts</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalPronunciationAttempts}</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Mic className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-card rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg. Accuracy</p>
                      <p className="text-3xl font-bold text-foreground">{stats.averagePronunciationAccuracy}%</p>
                    </div>
                    <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-card rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total XP Earned</p>
                      <p className="text-3xl font-bold text-foreground">{stats.totalXP.toLocaleString()}</p>
                    </div>
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                      <Zap className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Bar Chart - User Growth */}
              <Card className="bg-card border-0 shadow-card rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-foreground">User Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Active Users</span>
                        <span className="font-semibold text-foreground">{stats.totalUsers}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((stats.totalUsers / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Lessons Completed</span>
                        <span className="font-semibold text-foreground">{stats.totalLessons}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((stats.totalLessons / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donut Chart - Accuracy */}
              <Card className="bg-card border-0 shadow-card rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Pronunciation Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="currentColor"
                          strokeWidth="16"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="currentColor"
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 80}`}
                          strokeDashoffset={`${2 * Math.PI * 80 * (1 - stats.averagePronunciationAccuracy / 100)}`}
                          className="text-success transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-foreground">{stats.averagePronunciationAccuracy}%</p>
                          <p className="text-sm text-muted-foreground">Average</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart - XP Distribution */}
              <Card className="bg-card border-0 shadow-card rounded-3xl lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-foreground">Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-4">
                    {[
                      { label: "Users", value: stats.totalUsers, max: 100 },
                      { label: "Lessons", value: stats.totalLessons, max: 10 },
                      { label: "Attempts", value: stats.totalPronunciationAttempts, max: 200 },
                      { label: "Accuracy", value: stats.averagePronunciationAccuracy, max: 100 },
                      { label: "XP (K)", value: stats.totalXP / 1000, max: 50 },
                    ].map((item, index) => {
                      const height = Math.min((item.value / item.max) * 100, 100);
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full relative bg-muted rounded-t-lg overflow-hidden" style={{ height: '200px' }}>
                            <div
                              className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg transition-all duration-500"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-semibold">{item.label}</span>
                          <span className="text-xs text-foreground font-bold">{item.value.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded"></div>
                      <span className="text-sm text-muted-foreground">Total XP: {stats.totalXP.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground mb-6 font-display">Lesson Performance Analysis</h2>
            <div className="space-y-4">
              {lessonPerformance.map((lesson) => (
                <Card key={lesson.lessonId} className="bg-card border-0 shadow-card rounded-3xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          Lesson {lesson.lessonNumber}: {lesson.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{lesson.lessonId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-bold text-success">{lesson.completionRate}%</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="font-semibold text-foreground">{lesson.completionRate}%</span>
                        </div>
                        <Progress value={lesson.completionRate} variant="accent" className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Average Pronunciation Accuracy</span>
                          <span className="font-semibold text-foreground">{lesson.averagePronunciationAccuracy}%</span>
                        </div>
                        <Progress value={lesson.averagePronunciationAccuracy} variant="success" className="h-2" />
                      </div>
                      <div className="flex gap-6 text-sm text-muted-foreground pt-2">
                        <span>Completed: {lesson.completedCount} users</span>
                        <span>Total Users: {lesson.totalUsers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground font-display">Content Management</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAddLesson(true)}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lesson
                </Button>
                <Button
                  onClick={() => setShowAddSlide(true)}
                  variant="accent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slide
                </Button>
              </div>
            </div>

            {/* Add Lesson Modal */}
            {showAddLesson && (
              <Card className="bg-card border-0 shadow-elevated rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Add New Lesson</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddLesson} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">Lesson ID</label>
                        <Input
                          value={newLesson.lessonId}
                          onChange={(e) => setNewLesson({ ...newLesson, lessonId: e.target.value })}
                          placeholder="LS001"
                          className="bg-input border-0"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">Lesson Number</label>
                        <Input
                          type="number"
                          value={newLesson.lessonNumber}
                          onChange={(e) => setNewLesson({ ...newLesson, lessonNumber: parseInt(e.target.value) })}
                          className="bg-input border-0"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Title (English)</label>
                      <Input
                        value={newLesson.titleEnglish}
                        onChange={(e) => setNewLesson({ ...newLesson, titleEnglish: e.target.value })}
                        className="bg-input border-0"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Title (Sanskrit)</label>
                      <Input
                        value={newLesson.titleSanskrit}
                        onChange={(e) => setNewLesson({ ...newLesson, titleSanskrit: e.target.value })}
                        className="bg-input border-0"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Description</label>
                      <Input
                        value={newLesson.description}
                        onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                        className="bg-input border-0"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" variant="success">
                        Add Lesson
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddLesson(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Add Slide Modal */}
            {showAddSlide && (
              <Card className="bg-card border-0 shadow-elevated rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Add New Slide</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddSlide} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Select Lesson</label>
                      <select
                        value={selectedLessonForSlide}
                        onChange={(e) => setSelectedLessonForSlide(e.target.value)}
                        className="w-full h-10 px-3 bg-input border-0 rounded-xl text-foreground"
                        required
                      >
                        <option value="">Choose a lesson...</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.lesson_id} value={lesson.lesson_id}>
                            {lesson.lesson_id}: {lesson.title_english}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">Slide ID</label>
                        <Input
                          type="number"
                          value={newSlide.lessonSlideId}
                          onChange={(e) => setNewSlide({ ...newSlide, lessonSlideId: parseInt(e.target.value) })}
                          className="bg-input border-0"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-1 block">Order Index</label>
                        <Input
                          type="number"
                          value={newSlide.orderIndex}
                          onChange={(e) => setNewSlide({ ...newSlide, orderIndex: parseInt(e.target.value) })}
                          className="bg-input border-0"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Sanskrit</label>
                      <Input
                        value={newSlide.sanskrit}
                        onChange={(e) => setNewSlide({ ...newSlide, sanskrit: e.target.value })}
                        className="bg-input border-0"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Word</label>
                      <Input
                        value={newSlide.word}
                        onChange={(e) => setNewSlide({ ...newSlide, word: e.target.value })}
                        className="bg-input border-0"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Transliteration</label>
                      <Input
                        value={newSlide.transliteration}
                        onChange={(e) => setNewSlide({ ...newSlide, transliteration: e.target.value })}
                        className="bg-input border-0"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Meaning</label>
                      <Input
                        value={newSlide.meaning}
                        onChange={(e) => setNewSlide({ ...newSlide, meaning: e.target.value })}
                        className="bg-input border-0"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1 block">Example Meaning</label>
                      <Input
                        value={newSlide.exampleMeaning}
                        onChange={(e) => setNewSlide({ ...newSlide, exampleMeaning: e.target.value })}
                        className="bg-input border-0"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" variant="success">
                        Add Slide
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddSlide(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lessons List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Existing Lessons</h3>
              {lessons.map((lesson) => (
                <Card key={lesson.lesson_id} className="bg-card border-0 shadow-card rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-foreground">
                          {lesson.lesson_id}: {lesson.title_english}
                        </h4>
                        <p className="text-sm text-muted-foreground">{lesson.title_sanskrit}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{lesson.difficulty_level}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
