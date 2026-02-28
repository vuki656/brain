export function generateId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""

    for (let index = 0; index < 6; index++) {
        result = result + chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
}
