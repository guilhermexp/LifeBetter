
import React from 'react';
import { DialogBody, DialogFooter } from "@/components/ui/dialog";
import { useUser } from '@/providers/UserProvider';
import { useHabitForm } from '@/hooks/useHabitForm';

// Import field components
import { 
  TitleField, 
  DescriptionField, 
  AreaFrequencyFields, 
  DateTimeFields, 
  DurationField,
  FormActions
} from './HabitFormFields';

interface HabitFormProps {
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId?: string;
}

export function HabitForm({ onOpenChange, onSuccess, userId }: HabitFormProps) {
  const userContext = useUser();
  const currentUserId = userId || (userContext?.user?.id || null);
  
  const { 
    formState: { title, description, frequency, time, area, duration, date, isSubmitting },
    setters: { setTitle, setDescription, setFrequency, setTime, setArea, setDuration, setDate },
    handleSubmit 
  } = useHabitForm({ 
    onOpenChange, 
    onSuccess, 
    userId: currentUserId || undefined 
  });

  return (
    <>
      <DialogBody>
        <form onSubmit={handleSubmit} className="space-y-5">
          <TitleField value={title} onChange={setTitle} />
          
          <DescriptionField value={description} onChange={setDescription} />
          
          <AreaFrequencyFields 
            area={area}
            frequency={frequency}
            onAreaChange={setArea}
            onFrequencyChange={setFrequency}
          />
          
          <DateTimeFields 
            date={date}
            time={time}
            onDateChange={(newDate) => newDate && setDate(newDate)}
            onTimeChange={setTime}
          />
          
          <DurationField value={duration} onChange={setDuration} />
          
          <DialogFooter className="px-0 pb-0 pt-2">
            <FormActions 
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSubmitting}
            />
          </DialogFooter>
        </form>
      </DialogBody>
    </>
  );
}
