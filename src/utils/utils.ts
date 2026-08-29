import type { ProjectMember } from '../../api/projects.api';

export function getMemberName(userId: string, members: ProjectMember[]) {
    const member = members.find((member) => member.user.id === userId);
    return member?.user.nickName ?? 'Unknown';
}

export function getUserIdFromToken(token: string | null) {
    if (!token) {
        return null;
    }

    const parts = token.split('.');

    if (parts.length < 2) {
        return null;
    }

    try {
        const payload = JSON.parse(decodeBase64Url(parts[1])) as { sub?: string };
        return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
        return null;
    }
}

function decodeBase64Url(value: string) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
}