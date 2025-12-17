import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  TrendingUp,
  Users,
  Award,
  Eye,
  Download,
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';

interface DashboardHomeProps {
  onViewAnalysis: (resumeId: string) => void;
}

export function DashboardHome({ onViewAnalysis }: DashboardHomeProps) {
  const stats = [
    {
      title: 'Total Resumes',
      value: '1,247',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Average ATS Score',
      value: '74.2',
      change: '+3.1',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Candidates',
      value: '892',
      change: '+8%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'This Month',
      value: '156',
      change: '+24%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const skillsData = [
    { skill: 'JavaScript', count: 234, percentage: 78 },
    { skill: 'Python', count: 189, percentage: 63 },
    { skill: 'React', count: 156, percentage: 52 },
    { skill: 'Node.js', count: 134, percentage: 45 },
    { skill: 'SQL', count: 123, percentage: 41 },
  ];

  const trendsData = [
    { month: 'Jan', resumes: 120, avgScore: 72 },
    { month: 'Feb', resumes: 145, avgScore: 74 },
    { month: 'Mar', resumes: 132, avgScore: 73 },
    { month: 'Apr', resumes: 168, avgScore: 75 },
    { month: 'May', resumes: 156, avgScore: 74 },
    { month: 'Jun', resumes: 189, avgScore: 76 },
  ];

  const scoreDistribution = [
    { range: '90-100', count: 45, color: '#10B981' },
    { range: '80-89', count: 123, color: '#3B82F6' },
    { range: '70-79', count: 234, color: '#F59E0B' },
    { range: '60-69', count: 156, color: '#EF4444' },
    { range: '<60', count: 89, color: '#6B7280' },
  ];

  const recentResumes = [
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'Frontend Developer',
      score: 85,
      uploadDate: '2024-01-15',
      status: 'analyzed',
    },
    {
      id: '2',
      name: 'Michael Chen',
      position: 'Data Scientist',
      score: 92,
      uploadDate: '2024-01-14',
      status: 'analyzed',
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      position: 'UX Designer',
      score: 78,
      uploadDate: '2024-01-13',
      status: 'processing',
    },
    {
      id: '4',
      name: 'David Wilson',
      position: 'Backend Developer',
      score: 88,
      uploadDate: '2024-01-12',
      status: 'analyzed',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50';
    if (score >= 80) return 'bg-blue-50';
    if (score >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your resume analysis performance</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Last updated: 2 minutes ago</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.color}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trends Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Resume Analysis Trends</CardTitle>
            <CardDescription>Monthly overview of processed resumes and average scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="resumes" fill="#3B82F6" name="Resumes" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#10B981" strokeWidth={2} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of ATS scores across all resumes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
            <CardDescription>Most frequently mentioned skills in resumes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillsData.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{skill.skill}</span>
                  <span className="text-sm text-gray-500">{skill.count}</span>
                </div>
                <Progress value={skill.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Resumes */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Resumes</CardTitle>
            <CardDescription>Latest uploaded and analyzed resumes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{resume.name}</p>
                      <p className="text-sm text-gray-500">{resume.position}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getScoreBgColor(resume.score)}`}>
                        <span className={getScoreColor(resume.score)}>{resume.score}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">ATS Score</p>
                    </div>
                    
                    <Badge variant={resume.status === 'analyzed' ? 'default' : 'secondary'} className="text-xs">
                      {resume.status === 'analyzed' ? 'Analyzed' : 'Processing'}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewAnalysis(resume.id)}
                        disabled={resume.status !== 'analyzed'}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}