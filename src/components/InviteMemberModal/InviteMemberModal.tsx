import Modal from '../../components/Modal/Modal';

type InviteMemberModalProps = {
    isOpen: boolean;
    email: string;
    isInviting: boolean;
    error: string | null;
    onEmailChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
};

function InviteMemberModal({ isOpen, email, isInviting, error, onEmailChange, onSubmit, onClose }: InviteMemberModalProps) {
    return (
        <Modal isOpen={isOpen} title="Invite member" onClose={() => !isInviting && onClose()}>
            <div className="invite-member">
                <label htmlFor="project-member-email">Email</label>
                <input
                    id="project-member-email"
                    type="email"
                    placeholder="member@example.com"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') onSubmit();
                    }}
                    autoFocus
                />

                {error && <p className="invite-member-error">{error}</p>}

                <div className="invite-member-actions">
                    <button type="button" onClick={onClose} disabled={isInviting}>
                        Cancel
                    </button>
                    <button type="button" onClick={onSubmit} disabled={isInviting || !email.trim()}>
                        {isInviting ? 'Inviting...' : 'Invite'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default InviteMemberModal;