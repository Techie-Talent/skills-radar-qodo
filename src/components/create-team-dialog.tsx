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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Team {
  id: number
  name: string
  description: string | null
  parentTeamId: number | null
}

interface CreateTeamDialogProps {
  teams: Team[]
  trigger?: React.ReactNode
}

export function CreateTeamDialog({ teams, trigger }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parentTeamId, setParentTeamId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Get potential parent teams (teams that don't have a parent themselves or are root teams)
  const potentialParentTeams = teams.filter(team => !team.parentTeamId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Team name is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          parentTeamId: parentTeamId && parentTeamId !== 'none' ? parentTeamId : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Reset form
        setName('')
        setDescription('')
        setParentTeamId('')
        setOpen(false)
        
        // Refresh the page to show the new team
        router.refresh()
      } else {
        setError(data.error || 'Failed to create team')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      setError('Failed to create team. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when dialog closes
      setName('')
      setDescription('')
      setParentTeamId('')
      setError('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create New Team
            </DialogTitle>
            <DialogDescription>
              Create a new team to organize members and manage projects.
              Teams can be organized hierarchically with parent teams.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Development Team, Marketing, Client Services"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the team's purpose and responsibilities..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parentTeam">Parent Team (Optional)</Label>
              <Select value={parentTeamId} onValueChange={setParentTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent team (Root team)</SelectItem>
                  {potentialParentTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sub-teams inherit from parent teams. Leave empty to create a root team.
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
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}