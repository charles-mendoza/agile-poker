'use server'

import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { Room } from './types'

export async function createRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const roomRef = doc(db, 'rooms', roomId)
    const newRoom: Omit<Room, 'id'> = {
      name: `Room ${roomId}`,
      description: '',
      cardSet: 'scrum',
      revealMode: 'transparent',
      stories: [],
      players: {},
      currentStoryId: null,
      state: 'setup',
      createdAt: serverTimestamp(),
    }
    await setDoc(roomRef, newRoom)
    return { success: true }
  } catch (error) {
    console.error('Error creating room: ', error)
    return { success: false, error: 'Failed to create room on the server.' }
  }
}
