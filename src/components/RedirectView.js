import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RedirectView() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/final/login');
    });

    return;
}