// Default checklist templates by festival type. Applied when a festival is
// created (or when the user resets its checklist). Labels are i18n keys so the
// list renders in the active language; a resolved copy is stored per festival.

import type { ChecklistItem, FestivalType } from '../lib/types'
import { uuid } from '../lib/storage'

export interface ChecklistTemplateItem {
  /** i18n key under `checklist.items.*` */
  key: string
  group: 'essentials' | 'camping' | 'comfort' | 'transport' | 'urban'
}

const essentials: ChecklistTemplateItem[] = [
  { key: 'ticket', group: 'essentials' },
  { key: 'id', group: 'essentials' },
  { key: 'phone', group: 'essentials' },
  { key: 'powerbank', group: 'essentials' },
  { key: 'cash', group: 'essentials' },
  { key: 'bankCard', group: 'essentials' },
  { key: 'earplugs', group: 'essentials' },
  { key: 'sunscreen', group: 'essentials' },
  { key: 'meds', group: 'essentials' },
]

const camping: ChecklistTemplateItem[] = [
  { key: 'tent', group: 'camping' },
  { key: 'sleepingBag', group: 'camping' },
  { key: 'sleepingMat', group: 'camping' },
  { key: 'pillow', group: 'camping' },
  { key: 'headlamp', group: 'camping' },
  { key: 'campingChair', group: 'camping' },
  { key: 'coolerBox', group: 'camping' },
  { key: 'trashBags', group: 'camping' },
  { key: 'toiletPaper', group: 'camping' },
  { key: 'wetWipes', group: 'comfort' },
  { key: 'towel', group: 'comfort' },
  { key: 'toiletries', group: 'comfort' },
  { key: 'rainJacket', group: 'comfort' },
  { key: 'warmLayer', group: 'comfort' },
  { key: 'flipFlops', group: 'comfort' },
  { key: 'reusableBottle', group: 'comfort' },
]

const day: ChecklistTemplateItem[] = [
  { key: 'rainJacket', group: 'comfort' },
  { key: 'reusableBottle', group: 'comfort' },
  { key: 'hat', group: 'comfort' },
  { key: 'snacks', group: 'comfort' },
]

const urban: ChecklistTemplateItem[] = [
  { key: 'hotelBooking', group: 'urban' },
  { key: 'transportPass', group: 'transport' },
  { key: 'transportTickets', group: 'transport' },
  { key: 'comfortableShoes', group: 'comfort' },
  { key: 'dayBag', group: 'comfort' },
  { key: 'reusableBottle', group: 'comfort' },
]

export function templateFor(type: FestivalType): ChecklistTemplateItem[] {
  const extra = type === 'camping' ? camping : type === 'urban' ? urban : day
  return [...essentials, ...extra]
}

/**
 * Build the concrete checklist for a festival type. Template items store an
 * i18n `key` (resolved to the active language at render time, so they stay
 * bilingual); custom items added later store a free-text `label` instead.
 */
export function createChecklist(type: FestivalType): ChecklistItem[] {
  return templateFor(type).map((item) => ({
    id: uuid(),
    key: item.key,
    checked: false,
    group: item.group,
  }))
}
