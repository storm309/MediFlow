import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        sidebarOpen: true,
        darkMode:    localStorage.getItem('mediflow_dark') === 'true',
        modal:       null,  // { type: 'string', data: any }
    },
    reducers: {
        toggleSidebar: (s)         => { s.sidebarOpen = !s.sidebarOpen; },
        setSidebar:    (s, a)      => { s.sidebarOpen = a.payload; },
        toggleDarkMode: (s)        => {
            s.darkMode = !s.darkMode;
            localStorage.setItem('mediflow_dark', String(s.darkMode));
            document.documentElement.classList.toggle('dark', s.darkMode);
        },
        openModal:  (s, a) => { s.modal = a.payload; },
        closeModal: (s)    => { s.modal = null; },
    },
});

export const { toggleSidebar, setSidebar, toggleDarkMode, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;

export const selectSidebarOpen = (s) => s.ui.sidebarOpen;
export const selectDarkMode    = (s) => s.ui.darkMode;
export const selectModal       = (s) => s.ui.modal;
