import { SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';

export default function SuccessIcon(props: SvgIconProps) {
    return (
        <SvgIcon
            {...props}
            viewBox="0 0 16 16"
            component={(svgProps: SvgIconProps) => {
                return (
                    <svg {...svgProps} fill="currentColor" fill-rule="evenodd">
                        <title>{props.titleAccess}</title>
                        <path d="M11.922 6.375l-4.328 4.359c-.188.146-.37.219-.547.219h-.375a.791.791 0 0 1-.297-.062.739.739 0 0 1-.25-.157L4.078 8.672A.344.344 0 0 1 4 8.445c0-.088.026-.164.078-.226l.813-.797a.254.254 0 0 1 .219-.11c.093 0 .17.037.234.11L6.64 8.719a.308.308 0 0 0 .226.094.314.314 0 0 0 .227-.094l3.562-3.594a.41.41 0 0 1 .243-.078.29.29 0 0 1 .21.078l.813.797a.408.408 0 0 1 .078.242.285.285 0 0 1-.078.211m3.445-1.477a8.039 8.039 0 0 0-1.703-2.546A8.118 8.118 0 0 0 11.11.641 7.777 7.777 0 0 0 8 0a7.784 7.784 0 0 0-3.101.633 8.032 8.032 0 0 0-2.547 1.703A8.11 8.11 0 0 0 .64 4.891 7.748 7.748 0 0 0 0 8c0 1.083.21 2.117.633 3.102a8.022 8.022 0 0 0 1.703 2.546 8.1 8.1 0 0 0 2.555 1.711A7.762 7.762 0 0 0 8 16a7.796 7.796 0 0 0 3.102-.633 8.055 8.055 0 0 0 2.547-1.703 8.15 8.15 0 0 0 1.71-2.555C15.787 10.12 16 9.083 16 8a7.796 7.796 0 0 0-.632-3.102" />
                    </svg>
                );
            }}
        />
    );
}
