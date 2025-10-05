export type UserRecord = {
  id: string
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  avatarUrl?: string
}

const users = new Map<number, UserRecord>()

export const findOrCreateUserByTelegramId = async (
  data: Omit<UserRecord, "id">,
): Promise<UserRecord> => {
  const existing = users.get(data.telegramId)
  if (existing) {
    const next: UserRecord = {
      ...existing,
      firstName: data.firstName ?? existing.firstName,
      lastName: data.lastName ?? existing.lastName,
      username: data.username ?? existing.username,
      avatarUrl: data.avatarUrl ?? existing.avatarUrl,
    }
    users.set(data.telegramId, next)
    return next
  }

  const created: UserRecord = {
    id: `telegram:${data.telegramId}`,
    telegramId: data.telegramId,
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.username,
    avatarUrl: data.avatarUrl,
  }

  users.set(data.telegramId, created)
  return created
}

export const resetUserStore = () => {
  users.clear()
}
