PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE job_applications (
	id INTEGER NOT NULL, 
	company_name VARCHAR(200) NOT NULL, 
	role_title VARCHAR(200) NOT NULL, 
	location VARCHAR(200), 
	source VARCHAR(200), 
	apply_url VARCHAR(500), 
	stage VARCHAR(32) NOT NULL, 
	decision VARCHAR(32) NOT NULL, 
	priority INTEGER NOT NULL, 
	notes TEXT, 
	applied_at DATETIME, 
	last_status_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	PRIMARY KEY (id)
);
INSERT INTO job_applications VALUES(1,'Millennium','SWE Intern','Tel-Aviv','https://www.linkedin.com/jobs/view/4300326388/',NULL,'APPLIED','REJECTED',3,NULL,NULL,'2025-10-24 13:02:42.367037','2025-10-24 11:41:53','2025-10-24 13:02:42');
INSERT INTO job_applications VALUES(2,'Google','SWE Intern','Tel-Aviv','https://www.google.com/about/careers/applications/jobs/results/82001749891523270-parttime-software-engineering-bsms-intern-2026',NULL,'UNDER_REVIEW','PENDING',5,NULL,NULL,'2025-10-24 12:07:06','2025-10-24 12:07:06','2025-10-24 12:07:06');
INSERT INTO job_applications VALUES(3,'PayPal','SWE Inter - Backend Python','Tel-Aviv','https://www.linkedin.com/jobs/view/4300301308/',NULL,'UNDER_REVIEW','PENDING',5,NULL,NULL,'2025-10-24 12:08:43','2025-10-24 12:08:43','2025-10-24 12:08:43');
INSERT INTO job_applications VALUES(4,'Emerson','SWE intern','Central District','https://www.linkedin.com/jobs/view/4315672851/',NULL,'UNDER_REVIEW','PENDING',4,NULL,NULL,'2025-10-24 12:09:50','2025-10-24 12:09:50','2025-10-24 12:09:50');
INSERT INTO job_applications VALUES(5,'Hewlett Packard Enterprise','Automation Intern','Herzliya','https://www.linkedin.com/jobs/view/4290957049/',NULL,'UNDER_REVIEW','PENDING',2,NULL,NULL,'2025-10-24 12:10:50','2025-10-24 12:10:50','2025-10-24 12:10:50');
INSERT INTO job_applications VALUES(6,'SAP','Student Software developer','Raanana','https://www.linkedin.com/jobs/view/4270240931/',NULL,'UNDER_REVIEW','PENDING',2,NULL,NULL,'2025-10-24 12:11:32','2025-10-24 12:11:32','2025-10-24 12:11:32');
INSERT INTO job_applications VALUES(7,'ServiceNow','SWE Intern - Service Mapping','Petah Tikva','https://www.linkedin.com/jobs/view/4317885109/',NULL,'UNDER_REVIEW','PENDING',3,NULL,NULL,'2025-10-24 12:13:56','2025-10-24 12:13:56','2025-10-24 12:13:56');
INSERT INTO job_applications VALUES(8,'ServiceNow','SWE Intern - Cloud Development','Petah Tikva','https://www.linkedin.com/jobs/view/4317877306/',NULL,'UNDER_REVIEW','PENDING',3,NULL,NULL,'2025-10-24 12:14:29','2025-10-24 12:14:29','2025-10-24 12:14:29');
INSERT INTO job_applications VALUES(9,'Imagene','Student SWE','Tel Aviv','https://www.linkedin.com/jobs/view/4305068917/',NULL,'UNDER_REVIEW','PENDING',2,NULL,NULL,'2025-10-24 12:15:03','2025-10-24 12:15:03','2025-10-24 12:15:03');
INSERT INTO job_applications VALUES(10,'AWS','Software Embedded Student','Haifa','https://www.linkedin.com/jobs/view/4318500216/',NULL,'UNDER_REVIEW','PENDING',2,NULL,NULL,'2025-10-24 12:16:20','2025-10-24 12:16:20','2025-10-24 12:16:20');
INSERT INTO job_applications VALUES(11,'Hewlett Packard Enterprise','QA intern','Herzliya','https://www.linkedin.com/jobs/view/4290957071/',NULL,'UNDER_REVIEW','PENDING',2,NULL,NULL,'2025-10-24 12:22:45','2025-10-24 12:22:45','2025-10-24 12:22:45');
CREATE INDEX ix_job_apps_last_status_at_desc ON job_applications (last_status_at);
CREATE INDEX ix_job_applications_id ON job_applications (id);
CREATE INDEX ix_job_apps_stage ON job_applications (stage);
CREATE INDEX ix_job_apps_decision ON job_applications (decision);
COMMIT;
