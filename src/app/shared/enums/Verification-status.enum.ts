export enum VerificationStatus {
    Pending = 'Pending',
    InReview = 'InReview',
    Verified = 'Verified',
    Rejected = 'Rejected',
    Suspended = 'Suspended'
}

export const VerificationStatusTransitions: { [key: string]: VerificationStatus[] } = {
    [VerificationStatus.Pending]: [VerificationStatus.InReview, VerificationStatus.Verified, VerificationStatus.Rejected],
    [VerificationStatus.InReview]: [VerificationStatus.Verified, VerificationStatus.Rejected, VerificationStatus.Pending],
    [VerificationStatus.Verified]: [VerificationStatus.Suspended, VerificationStatus.InReview],
    [VerificationStatus.Rejected]: [VerificationStatus.InReview, VerificationStatus.Pending],
    [VerificationStatus.Suspended]: [VerificationStatus.Verified, VerificationStatus.Rejected]
};

export const isValidVerificationTransition = (currentStatus: VerificationStatus, newStatus: VerificationStatus): boolean => {
    return VerificationStatusTransitions[currentStatus]?.includes(newStatus) || false;
};

export const getAllVerificationStatuses = (): VerificationStatus[] => {
    return Object.values(VerificationStatus);
};