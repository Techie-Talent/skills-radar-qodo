'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star, Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Member {
  id: number
  fullName: string | null
  email: string
  username: string | null
}

interface PointPeriod {
  id: number
  name: string
  isActive: boolean
  isClosed: boolean
  pointsPerMember: number
}

interface GivePointsDialogProps {
  members: Member[]
  currentMemberId?: number
  trigger?: React.ReactNode
}

export function GivePointsDialog({ members, currentMemberId, trigger }: GivePointsDialogProps) {
  const [open, setOpen] = useState(false)
  const [receiverId, setReceiverId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [activePeriod, setActivePeriod] = useState<PointPeriod | null>(null)
  const [remainingPoints, setRemainingPoints] = useState(0)
  const router = useRouter()

  // Filter out current member from recipients
  const availableMembers = members.filter(member => member.id !== currentMemberId)

  const fetchRemainingPoints = useCallback(async (periodId: number) => {
    try {
      const response = await fetch(`/api/points?periodId=${periodId}&giverId=${currentMemberId}`)
      const points = await response.json()
      const totalUsed = points.reduce((sum: number, point: { amount: number }) => sum + point.amount, 0)
      setRemainingPoints((activePeriod?.pointsPerMember || 3) - totalUsed)
    } catch (error) {
      console.error('Error fetching remaining points:', error)
    }
  }, [currentMemberId, activePeriod?.pointsPerMember])

  const fetchActivePeriod = useCallback(async () => {
    try {
      const response = await fetch('/api/points/periods')
      const periods = await response.json()
      const active = periods.find((p: PointPeriod) => p.isActive && !p.isClosed)
      
      if (active) {
        setActivePeriod(active)
        if (currentMemberId) {
          fetchRemainingPoints(active.id)
        }
      }
    } catch (error) {
      console.error('Error fetching active period:', error)
    }
  }, [currentMemberId, fetchRemainingPoints]);

  useEffect(() => {
    if (open) {
      fetchActivePeriod()
    }
  }, [open, fetchActivePeriod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiverId || !amount || !activePeriod || !currentMemberId) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giverId: currentMemberId,
          receiverId: parseInt(receiverId),
          amount: parseInt(amount),
          message: message.trim() || null,
          periodId: activePeriod.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Reset form
        setReceiverId('')
        setAmount('')
        setMessage('')
        setOpen(false)
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setError(data.error || 'Failed to give points')
      }
    } catch (error) {
      console.error('Error giving points:', error)
      setError('Failed to give points. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      setReceiverId('')
      setAmount('')
      setMessage('')
      setError('')
    }
  }

  if (!activePeriod) {
    return null // Don't show if no active period
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Gift className="h-4 w-4 mr-2" />
            Give Points
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Give Points - {activePeriod.name}
            </DialogTitle>
            <DialogDescription>
              Give points to recognize great work and collaboration. 
              You have {remainingPoints} points remaining this period.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="receiver">Give Points To *</Label>
              <Select value={receiverId} onValueChange={setReceiverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.fullName || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Points Amount *</Label>
              <Select value={amount} onValueChange={setAmount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select points amount" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].filter(points => points <= remainingPoints).map((points) => (
                    <SelectItem key={points} value={points.toString()}>
                      {points} {points === 1 ? 'point' : 'points'}
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
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a message explaining why you're giving these points..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
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
              disabled={!receiverId || !amount || remainingPoints === 0 || isSubmitting}
            >
              {isSubmitting ? 'Giving Points...' : 'Give Points'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}