import React, { FC, memo } from 'react';
import styles from './modal.module.css';
import { CloseIcon } from '@zlden/react-developer-burger-ui-components';
import { TModalUIProps } from './type';
import { ModalOverlayUI } from '@ui';

export const ModalUI: FC<TModalUIProps> = memo(
  ({ title, onClose, children }) => {
    const getModalType = () => {
      if (
        React.Children.toArray(children).some(
          (child: any) =>
            child?.props?.orderNumber || child?.type?.name === 'OrderDetailsUI'
        )
      ) {
        return 'order-modal';
      }
      return 'ingredient-modal';
    };

    return (
      <>
        <div className={styles.modal} data-cy={getModalType()}>
          <div className={styles.header}>
            <h3 className={`${styles.title} text text_type_main-large`}>
              {title}
            </h3>
            <button
              className={styles.button}
              type='button'
              data-cy='modal-close'
            >
              <CloseIcon type='primary' onClick={onClose} />
            </button>
          </div>
          <div className={styles.content}>{children}</div>
        </div>
        <ModalOverlayUI onClick={onClose} />
      </>
    );
  }
);
