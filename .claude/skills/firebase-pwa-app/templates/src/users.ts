// The known users. Add a name here to let a new person join in.
export const USERS = ['PersonA', 'PersonB'] as const

export type UserName = (typeof USERS)[number]
