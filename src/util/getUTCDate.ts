export function getUTCDate() {
    const now = new Date();
    const utcMilliSeconds = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
    );
    return new Date(utcMilliSeconds);
}