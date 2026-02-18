import { useState, useCallback } from 'react';
import { z } from 'zod';

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    const validate = useCallback((data: unknown) => {
        try {
            schema.parse(data);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: any = {};
                error.issues.forEach(err => {
                    if (err.path[0]) {
                        formattedErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(formattedErrors);
            }
            return false;
        }
    }, [schema]);

    return { errors, validate };
}
