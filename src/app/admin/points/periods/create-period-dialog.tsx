'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CreatePeriodDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pointsPerMember, setPointsPerMember] = useState('3')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) {
      setError('Please fill in all required fields')
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/points/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          startDate,
          endDate,
          pointsPerMember: parseInt(pointsPerMember),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Reset form
        setName('')
        setStartDate('')
        setEndDate('')
        setPointsPerMember('3')
        setOpen(false)
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setError(data.error || 'Failed to create period')
      }
    } catch (error) {
      console.error('Error creating period:', error)
      setError('Failed to create period. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      setName('')
      setStartDate('')
      setEndDate('')
      setPointsPerMember('3')
      setError('')
    }
  }

  // Generate default dates (current month)
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  const defaultStartDate = firstDay.toISOString().split('T')[0]
  const defaultEndDate = lastDay.toISOString().split('T')[0]
  const defaultName = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Period
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Point Period</DialogTitle>
            <DialogDescription>
              Create a new period for team members to give points to each other.
              Each member can give a limited number of points per period.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Period Name *</Label>
              <Input
                id="name"
                placeholder={defaultName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate || defaultStartDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate || defaultEndDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pointsPerMember">Points per Member</Label>
              <Select value={pointsPerMember} onValueChange={setPointsPerMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select points per member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 point per member</SelectItem>
                  <SelectItem value="2">2 points per member</SelectItem>
                  <SelectItem value="3">3 points per member</SelectItem>
                  <SelectItem value="4">4 points per member</SelectItem>
                  <SelectItem value="5">5 points per member</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Maximum number of points each member can give during this period.
              </p>
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
              disabled={!name.trim() || !startDate || !endDate || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Period'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}