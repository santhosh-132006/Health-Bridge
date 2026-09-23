package com.healthbridge.service;

import com.healthbridge.entity.Notification;
import com.healthbridge.entity.User;
import com.healthbridge.exception.ResourceNotFoundException;
import com.healthbridge.repository.NotificationRepository;
import com.healthbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        if (userId != null) {
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public long getUnreadCount(Long userId) {
        if (userId != null) {
            return notificationRepository.countByUserIdAndIsReadFalse(userId);
        }
        return 0;
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notice = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notice.setIsRead(true);
        return notificationRepository.save(notice);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notices = getNotificationsForUser(userId);
        for (Notification n : notices) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(notices);
    }

    @Transactional
    public Notification createNotification(Long userId, String title, String message, String type) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        Notification notice = new Notification(user, title, message, type);
        return notificationRepository.save(notice);
    }
}
