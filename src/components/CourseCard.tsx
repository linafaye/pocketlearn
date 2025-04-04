import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { 
  Headphones,
  MousePointer,
  Video
} from "lucide-react";
import { LearningCourse } from "@/utils/learningPathUtils";
import { useAuth } from "@/contexts/AuthContext";
import CourseMetadata from "./CourseMetadata";
import CourseProgress from "./CourseProgress";
import CourseActionButton from "./CourseActionButton";
import CourseAudioControls from "./CourseAudioControls";
import CourseAudioDialog from "./CourseAudioDialog";
import CourseBookmarkButton from "./CourseBookmarkButton";
import CourseVideoPlayer from "./CourseVideoPlayer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  course: LearningCourse;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const { addCourseToQueue, removeCourseFromQueue, isInQueue } = useAuth();
  const getFormatIcon = () => {
    switch(course.format) {
      case "audio": return Headphones;
      case "video": return Video;
      default: return MousePointer;
    }
  };
  const FormatIcon = getFormatIcon();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAudioContent, setShowAudioContent] = useState(false);
  const [showVideoContent, setShowVideoContent] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const inQueue = isInQueue(course.id);
  
  const handleAudioToggle = () => {
    if (!audioRef.current || !course.audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleAudioContentView = () => {
    setShowAudioContent(true);
  };

  const handleVideoContentView = () => {
    if (course.format === "video" && course.videoUrl) {
      navigate(`/course/${course.id}`);
    } else {
      setShowVideoContent(!showVideoContent);
    }
  };
  
  const handleQueueToggle = () => {
    if (inQueue) {
      removeCourseFromQueue(course.id);
    } else {
      addCourseToQueue(course.id);
    }
  };
  
  useEffect(() => {
    if (course.format === "audio" && course.audioUrl) {
      audioRef.current = new Audio(course.audioUrl);
      
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener("ended", () => setIsPlaying(false));
        }
      };
    }
  }, [course]);
  
  return (
    <>
      <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        <div 
          className="aspect-video bg-muted flex items-center justify-center p-6 cursor-pointer"
          onClick={course.format === "video" ? handleVideoContentView : undefined}
        >
          {course.videoUrl && showVideoContent ? (
            <CourseVideoPlayer videoUrl={course.videoUrl} title={course.title} />
          ) : (
            <img 
              src={course.image} 
              alt={course.title}
              className="w-20 h-20 object-contain"
            />
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs text-muted-foreground">{course.category}</span>
              <h3 className="font-semibold">{course.title}</h3>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-1">
                <FormatIcon className="h-3 w-3" />
                <span className="capitalize">
                  {course.level}
                </span>
              </div>
              <CourseBookmarkButton 
                inQueue={inQueue}
                onToggle={handleQueueToggle}
              />
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {course.description}
          </p>
          
          <CourseMetadata 
            duration={course.duration} 
            format={course.format}
            FormatIcon={FormatIcon}
          />
          
          <CourseProgress value={course.progress || 0} />
          
          <div className="mt-auto">
            {course.format === "audio" && (course.audioUrl || course.audioContent) ? (
              <div className="flex gap-2">
                <CourseAudioControls 
                  isPlaying={isPlaying}
                  audioUrl={course.audioUrl}
                  audioContent={course.audioContent}
                  onAudioToggle={handleAudioToggle}
                  onViewContent={handleAudioContentView}
                />
                
                <CourseActionButton progress={course.progress || 0} courseTitle={course.title} />
              </div>
            ) : course.format === "video" && course.videoUrl ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleVideoContentView}
                  className="flex-1"
                >
                  Watch Video
                </Button>
                <CourseActionButton progress={course.progress || 0} courseTitle={course.title} />
              </div>
            ) : (
              <CourseActionButton progress={course.progress || 0} courseTitle={course.title} />
            )}
          </div>
        </div>
      </Card>
      
      <CourseAudioDialog
        title={course.title}
        duration={course.duration}
        content={course.audioContent}
        open={showAudioContent}
        onOpenChange={setShowAudioContent}
      />
    </>
  );
};

export default CourseCard;
