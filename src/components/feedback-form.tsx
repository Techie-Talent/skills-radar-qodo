"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Star, Gift } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeedbackFormProps {
  memberId: number;
  memberName: string;
  teamId?: number;
  teamName?: string;
  currentMemberId?: number;
  showPointsButton?: boolean | null;
}

interface PointPeriod {
  id: number;
  name: string;
  isActive: boolean;
  isClosed: boolean;
  pointsPerMember: number;
}

export function FeedbackForm({
  memberId,
  memberName,
  teamId,
  teamName,
  currentMemberId,
  showPointsButton = true,
}: FeedbackFormProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Points-related state
  const [includePoints, setIncludePoints] = useState(false);
  const [pointsAmount, setPointsAmount] = useState<string>("");
  const [pointsMessage, setPointsMessage] = useState("");
  const [activePeriod, setActivePeriod] = useState<PointPeriod | null>(null);
  const [remainingPoints, setRemainingPoints] = useState(0);
  const [pointsError, setPointsError] = useState("");

  const router = useRouter();

  const targetName = teamName || memberName;
  const isTeamFeedback = !!teamId;
  const canGivePoints =
    showPointsButton &&
    !isTeamFeedback &&
    currentMemberId &&
    currentMemberId !== memberId;

  const fetchRemainingPoints = useCallback(async (periodId: number) => {
    try {
      const response = await fetch(
        `/api/points?periodId=${periodId}&giverId=${currentMemberId}`
      );
      const points: { amount: number }[] = await response.json();
      const totalUsed = points.reduce(
        (sum: number, point) => sum + point.amount,
        0
      );
      setRemainingPoints((activePeriod?.pointsPerMember || 3) - totalUsed);
    } catch (error) {
      console.error("Error fetching remaining points:", error);
    }
  }, [currentMemberId, activePeriod?.pointsPerMember]);

  const fetchActivePeriod = useCallback(async () => {
    try {
      const response = await fetch("/api/points/periods");
      const periods = await response.json();
      const active = periods.find(
        (p: PointPeriod) => p.isActive && !p.isClosed
      );

      if (active) {
        setActivePeriod(active);
        if (currentMemberId) {
          fetchRemainingPoints(active.id);
        }
      }
    } catch (error) {
      console.error("Error fetching active period:", error);
    }
  }, [currentMemberId, fetchRemainingPoints]);

  useEffect(() => {
    if (open && canGivePoints) {
      fetchActivePeriod();
    }
  }, [open, canGivePoints, fetchActivePeriod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setPointsError("");

    try {
      // Submit feedback first
      const feedbackResponse = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          rating,
          isAnonymous,
          receiverId: teamId ? undefined : memberId,
          teamId: teamId || undefined,
        }),
      });

      if (!feedbackResponse.ok) {
        throw new Error("Failed to submit feedback");
      }

      // Submit points if included and valid
      if (
        includePoints &&
        pointsAmount &&
        activePeriod &&
        currentMemberId &&
        !isTeamFeedback
      ) {
        const pointsResponse = await fetch("/api/points", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            giverId: currentMemberId,
            receiverId: memberId,
            amount: parseInt(pointsAmount),
            message: pointsMessage.trim() || content.trim(), // Use points message or feedback content
            periodId: activePeriod.id,
          }),
        });

        if (!pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          setPointsError(pointsData.error || "Failed to give points");
          return;
        }
      }

      // Reset form and close dialog
      setContent("");
      setRating(null);
      setIsAnonymous(false);
      setIncludePoints(false);
      setPointsAmount("");
      setPointsMessage("");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setPointsError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setContent("");
      setRating(null);
      setIsAnonymous(false);
      setIncludePoints(false);
      setPointsAmount("");
      setPointsMessage("");
      setPointsError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Leave Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              Leave Feedback {isTeamFeedback ? "for Team" : "for"} {targetName}
            </DialogTitle>
            <DialogDescription>
              Share your thoughts and experiences working with {targetName}.
              Your feedback helps build a stronger team.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {pointsError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {pointsError}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="content">Feedback</Label>
              <Textarea
                id="content"
                placeholder={`Share your feedback about ${targetName}...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Rating (Optional)</Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(rating === i + 1 ? null : i + 1)}
                    className={`p-1 rounded transition-colors ${
                      rating && i < rating
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
              {rating && (
                <p className="text-sm text-muted-foreground">
                  {rating} out of 5 stars
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) =>
                  setIsAnonymous(checked as boolean)
                }
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit anonymously
              </Label>
            </div>

            {/* Points Section */}
            {canGivePoints && activePeriod && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePoints"
                      checked={includePoints}
                      onCheckedChange={(checked) => {
                        setIncludePoints(checked as boolean);
                        if (!checked) {
                          setPointsAmount("");
                          setPointsMessage("");
                        }
                      }}
                    />
                    <Label
                      htmlFor="includePoints"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Gift className="h-4 w-4 text-yellow-500" />
                      Also give points to {memberName}
                    </Label>
                  </div>

                  {includePoints && (
                    <div className="ml-6 space-y-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        {activePeriod.name} • {remainingPoints} points remaining
                      </p>

                      <div className="grid gap-2">
                        <Label htmlFor="pointsAmount">Points Amount</Label>
                        <Select
                          value={pointsAmount}
                          onValueChange={setPointsAmount}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select points amount" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3]
                              .filter((points) => points <= remainingPoints)
                              .map((points) => (
                                <SelectItem
                                  key={points}
                                  value={points.toString()}
                                >
                                  {points} {points === 1 ? "point" : "points"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {remainingPoints === 0 && (
                          <p className="text-xs text-muted-foreground">
                            You have used all your points for this period.
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="pointsMessage">
                          Points Message (Optional)
                        </Label>
                        <Textarea
                          id="pointsMessage"
                          placeholder="Add a specific message for the points (or leave blank to use feedback content)..."
                          value={pointsMessage}
                          onChange={(e) => setPointsMessage(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !content.trim() ||
                isSubmitting ||
                (includePoints && (!pointsAmount || remainingPoints === 0))
              }
            >
              {isSubmitting
                ? "Submitting..."
                : includePoints && pointsAmount
                ? `Submit Feedback & Give ${pointsAmount} Point${
                    pointsAmount !== "1" ? "s" : ""
                  }`
                : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
