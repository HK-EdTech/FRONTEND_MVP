import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Award,
  Target,
  Briefcase,
} from 'lucide-react';

export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('last30days');
  const [department, setDepartment] = useState('all');
  const [jobRole, setJobRole] = useState('all');

  // Mock data for charts
  const departmentData = [
    { department: 'Engineering', resumes: 245, avgScore: 82, fill: '#3B82F6' },
    { department: 'Marketing', resumes: 156, avgScore: 78, fill: '#10B981' },
    { department: 'Sales', resumes: 189, avgScore: 75, fill: '#F59E0B' },
    { department: 'Design', resumes: 98, avgScore: 85, fill: '#EF4444' },
    { department: 'HR', resumes: 67, avgScore: 73, fill: '#8B5CF6' },
  ];

  const scoreDistribution = [
    { range: '90-100', count: 125, percentage: 15 },
    { range: '80-89', count: 298, percentage: 36 },
    { range: '70-79', count: 234, percentage: 28 },
    { range: '60-69', count: 134, percentage: 16 },
    { range: '<60', count: 41, percentage: 5 },
  ];

  const monthlyTrends = [
    { month: 'Jul', resumes: 156, avgScore: 74.2, hired: 23 },
    { month: 'Aug', resumes: 189, avgScore: 75.8, hired: 31 },
    { month: 'Sep', resumes: 167, avgScore: 76.5, hired: 28 },
    { month: 'Oct', resumes: 203, avgScore: 77.1, hired: 35 },
    { month: 'Nov', resumes: 234, avgScore: 78.3, hired: 42 },
    { month: 'Dec', resumes: 198, avgScore: 79.1, hired: 38 },
  ];

  const skillDemand = [
    { skill: 'JavaScript', demand: 89, supply: 67, gap: 22 },
    { skill: 'Python', demand: 78, supply: 56, gap: 22 },
    { skill: 'React', demand: 72, supply: 45, gap: 27 },
    { skill: 'Node.js', demand: 65, supply: 34, gap: 31 },
    { skill: 'TypeScript', demand: 58, supply: 29, gap: 29 },
    { skill: 'AWS', demand: 67, supply: 23, gap: 44 },
  ];

  const topCompanies = [
    { company: 'Google', candidates: 45, avgScore: 88 },
    { company: 'Microsoft', candidates: 38, avgScore: 85 },
    { company: 'Amazon', candidates: 42, avgScore: 83 },
    { company: 'Meta', candidates: 29, avgScore: 87 },
    { company: 'Apple', candidates: 34, avgScore: 86 },
  ];

  const heatmapData = [
    { day: 'Mon', hour: '9', applications: 12 },
    { day: 'Mon', hour: '10', applications: 19 },
    { day: 'Mon', hour: '11', applications: 15 },
    { day: 'Tue', hour: '9', applications: 8 },
    { day: 'Tue', hour: '10', applications: 23 },
    { day: 'Tue', hour: '11', applications: 18 },
    // Add more data points for a complete heatmap
  ];

  const stats = [
    {
      title: 'Total Resumes Analyzed',
      value: '2,847',
      change: '+18%',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Average Score',
      value: '76.8',
      change: '+2.4',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Candidates Hired',
      value: '187',
      change: '+15%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Success Rate',
      value: '6.6%',
      change: '+0.8%',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your recruitment process</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex items-center space-x-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="last6months">Last 6 months</SelectItem>
                  <SelectItem value="lastyear">Last year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>

              <Select value={jobRole} onValueChange={setJobRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Job Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="frontend">Frontend Developer</SelectItem>
                  <SelectItem value="backend">Backend Developer</SelectItem>
                  <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                  <SelectItem value="designer">UI/UX Designer</SelectItem>
                  <SelectItem value="manager">Product Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Stats */}
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
                      {stat.change} from last period
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Resume volume and average scores by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="resumes" fill="#3B82F6" name="Resumes" />
                <Bar yAxisId="right" dataKey="avgScore" fill="#10B981" name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of ATS scores across all candidates</CardDescription>
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
                  label={({ range, percentage }) => `${range}: ${percentage}%`}
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Resume processing and hiring trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area yAxisId="left" type="monotone" dataKey="resumes" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Resumes Processed" />
              <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#10B981" strokeWidth={3} name="Average Score" />
              <Line yAxisId="right" type="monotone" dataKey="hired" stroke="#F59E0B" strokeWidth={2} name="Hired" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Skills Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Gap Analysis</CardTitle>
            <CardDescription>Supply vs demand for key technical skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillDemand.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-900">{skill.skill}</span>
                    <Badge variant={skill.gap > 30 ? 'destructive' : skill.gap > 20 ? 'secondary' : 'default'}>
                      {skill.gap}% gap
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Demand: {skill.demand}%</span>
                      <span>Supply: {skill.supply}%</span>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded">
                      <div
                        className="absolute left-0 top-0 h-full bg-red-200 rounded"
                        style={{ width: `${skill.demand}%` }}
                      />
                      <div
                        className="absolute left-0 top-0 h-full bg-green-500 rounded"
                        style={{ width: `${skill.supply}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Sources</CardTitle>
            <CardDescription>Top companies where candidates are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{company.company}</p>
                      <p className="text-xs text-gray-500">{company.candidates} candidates</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{company.avgScore}</p>
                    <p className="text-xs text-gray-500">Avg Score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Application Activity Heatmap</CardTitle>
          <CardDescription>When candidates are most likely to apply</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Heatmap visualization would be implemented here</p>
            <p className="text-sm mt-2">Showing application patterns by day and time</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}