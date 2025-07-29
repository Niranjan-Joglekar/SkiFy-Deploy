import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Star, Award } from "lucide-react";

interface MasteryScoreProps {
  score: number; // Score as percentage out of 100
}

export function MasteryScore({ score }: MasteryScoreProps) {
  const getMasteryLevel = (score: number) => {
    if (score >= 90) return { level: "Expert", color: "bg-green-500", description: "Outstanding mastery" };
    if (score >= 70) return { level: "Proficient", color: "bg-blue-500", description: "Strong understanding" };
    if (score >= 50) return { level: "Developing", color: "bg-yellow-500", description: "Good foundation" };
    if (score >= 30) return { level: "Beginner", color: "bg-orange-500", description: "Basic knowledge" };
    return { level: "Novice", color: "bg-red-500", description: "Needs improvement" };
  };

  const mastery = getMasteryLevel(score);

  // Convert percentage to 5-star rating for visual display
  const starRating = (score / 100) * 5;
  const fullStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Award className="h-6 w-6 text-primary" />
          Mastery Score
        </CardTitle>
        <CardDescription>Your overall performance assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center space-y-2">
          <div className="text-6xl text-primary">
            {score}
          </div>
          <div className="text-gray-500">out of 100</div>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center items-center gap-1">
          {/* Full Stars */}
          {Array.from({ length: fullStars }).map((_, i) => (
            <Star key={`full-${i}`} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
          ))}
          
          {/* Half Star */}
          {hasHalfStar && (
            <div className="relative">
              <Star className="h-8 w-8 text-gray-300" />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          )}
          
          {/* Empty Stars */}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <Star key={`empty-${i}`} className="h-8 w-8 text-gray-300" />
          ))}
        </div>

        {/* Mastery Level */}
        <div className="text-center space-y-3">
          <Badge 
            variant="secondary" 
            className={`${mastery.color} text-white px-4 py-2 text-lg`}
          >
            {mastery.level}
          </Badge>
          <p className="text-sm text-gray-600">{mastery.description}</p>
        </div>

        {/* Progress Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Novice</span>
            <span>Expert</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}