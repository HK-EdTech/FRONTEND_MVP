import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  ArrowLeft,
  Download,
  Star,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface ResumeAnalysisProps {
  resumeId: string | null;
  onBack: () => void;
}

export function ResumeAnalysis({ resumeId, onBack }: ResumeAnalysisProps) {
  // Mock data for the selected resume
  const resumeData = {
    id: resumeId || '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    position: 'Frontend Developer',
    experience: '5 years',
    education: 'B.S. Computer Science',
    atsScore: 85,
    uploadDate: '2024-01-15',
    fileName: 'sarah_johnson_resume.pdf',
  };

  const scoreData = [
    {
      name: 'ATS Score',
      value: resumeData.atsScore,
      fill: resumeData.atsScore >= 80 ? '#10B981' : resumeData.atsScore >= 70 ? '#F59E0B' : '#EF4444',
    },
  ];

  const skillsAnalysis = [
    { skill: 'JavaScript', mentioned: true, importance: 'High', score: 95 },
    { skill: 'React', mentioned: true, importance: 'High', score: 90 },
    { skill: 'TypeScript', mentioned: true, importance: 'Medium', score: 85 },
    { skill: 'Node.js', mentioned: false, importance: 'Medium', score: 0 },
    { skill: 'Python', mentioned: false, importance: 'Low', score: 0 },
    { skill: 'CSS', mentioned: true, importance: 'High', score: 88 },
    { skill: 'HTML', mentioned: true, importance: 'High', score: 92 },
    { skill: 'Git', mentioned: true, importance: 'Medium', score: 80 },
  ];

  const strengthsWeaknesses = {
    strengths: [
      { title: 'Strong Technical Skills', description: 'Excellent coverage of required programming languages' },
      { title: 'Relevant Experience', description: '5 years of direct experience in frontend development' },
      { title: 'Clear Formatting', description: 'Well-structured and ATS-friendly format' },
      { title: 'Quantified Achievements', description: 'Includes specific metrics and accomplishments' },
    ],
    weaknesses: [
      { title: 'Missing Keywords', description: 'Some important keywords like "Node.js" are missing' },
      { title: 'Education Details', description: 'Could include more details about relevant coursework' },
      { title: 'Certifications', description: 'No professional certifications mentioned' },
    ],
  };

  const recommendations = [
    {
      type: 'high',
      title: 'Add Missing Keywords',
      description: 'Include "Node.js", "API Development", and "Agile" to improve keyword matching.',
      impact: '+5-8 points',
    },
    {
      type: 'medium',
      title: 'Enhance Skills Section',
      description: 'Add skill proficiency levels and group related technologies together.',
      impact: '+3-5 points',
    },
    {
      type: 'low',
      title: 'Add Certifications',
      description: 'Include any relevant certifications or online courses completed.',
      impact: '+2-3 points',
    },
  ];

  const sectionScores = [
    { section: 'Contact Info', score: 100, maxScore: 100 },
    { section: 'Skills', score: 85, maxScore: 100 },
    { section: 'Experience', score: 90, maxScore: 100 },
    { section: 'Education', score: 75, maxScore: 100 },
    { section: 'Keywords', score: 70, maxScore: 100 },
    { section: 'Format', score: 95, maxScore: 100 },
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <Star className="w-5 h-5 text-yellow-600" />;
      case 'low': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl text-gray-900">Resume Analysis</h1>
            <p className="text-gray-600 mt-1">Detailed ATS compatibility report</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button>
            <Award className="w-4 h-4 mr-2" />
            Recommend Improvements
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Candidate Info & Score */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Candidate Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Candidate Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{resumeData.fileName}</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{resumeData.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{resumeData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{resumeData.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{resumeData.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{resumeData.position}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{resumeData.experience} experience</span>
              </div>
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{resumeData.education}</span>
              </div>
            </div>

            <Separator />

            {/* ATS Score */}
            <div className="text-center space-y-4">
              <h3 className="text-lg text-gray-900">ATS Compatibility Score</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={scoreData}>
                  <RadialBar dataKey="value" cornerRadius={10} fill={scoreData[0].fill} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-900">
                    {resumeData.atsScore}
                  </text>
                  <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-600">
                    out of 100
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
              <Badge className={`text-sm px-3 py-1 ${
                resumeData.atsScore >= 80 ? 'bg-green-100 text-green-800' :
                resumeData.atsScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {resumeData.atsScore >= 80 ? 'Excellent' :
                 resumeData.atsScore >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Analysis */}
        <div className="xl:col-span-2 space-y-6">
          {/* Section Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Section Analysis</CardTitle>
              <CardDescription>Breakdown of scores by resume section</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectionScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="section" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skills Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Skills Analysis</CardTitle>
              <CardDescription>Skill matching and keyword optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillsAnalysis.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {skill.mentioned ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <span className="text-sm text-gray-900">{skill.skill}</span>
                        <Badge className={`ml-2 text-xs ${getImportanceColor(skill.importance)}`}>
                          {skill.importance}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {skill.mentioned ? (
                        <span className="text-sm text-green-600">{skill.score}%</span>
                      ) : (
                        <span className="text-sm text-red-600">Missing</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strengthsWeaknesses.strengths.map((strength, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm text-green-900">{strength.title}</h4>
                  <p className="text-sm text-green-700 mt-1">{strength.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              <span>Areas for Improvement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strengthsWeaknesses.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm text-orange-900">{weakness.title}</h4>
                  <p className="text-sm text-orange-700 mt-1">{weakness.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Recommendations</CardTitle>
          <CardDescription>Actionable suggestions to boost your ATS score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {getRecommendationIcon(rec.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm text-gray-900">{rec.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {rec.impact}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}