import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface DeletionConfirmationModalProps {
  title: string;
  confirmationText: string;
  open: boolean;
  onClose: () => void;
  onConfirmation: () => void;
}

export default function DeletionConfirmationModal({
  title,
  confirmationText,
  open,
  onClose,
  onConfirmation,
}: DeletionConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
        </DialogHeader>

        <div>
          <p className="mb-4">{confirmationText}</p>

          <div className="flex justify-end gap-x-3">
            <Button onClick={onClose}>Não</Button>
            <Button onClick={onConfirmation} variant="destructive">
              Sim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
