USE [404146_CentralUser]
/****** Object:  StoredProcedure [dbo].[CallLogv4]    Script Date: 28-10-2026 12:27:37 ******/
SET ANSI_NULLS ON

SET QUOTED_IDENTIFIER ON

-- =============================================
-- Author:		<system,system>
-- Create date: <Create Date :: April 11 2025 10:54AM>
-- Description:	<Description :: >
-- =============================================
ALTER PROCEDURE [dbo].[CallLogv4]
	 @con NVARCHAR(MAX)= ''	
	,@p NVARCHAR(MAX)  = ''
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @FROMDate AS DATETIME=ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
	DECLARE @ProcedureName nvarchar(max)=OBJECT_NAME(@@PROCID)
	DECLARE @spname AS NVARCHAR(MAX)
	SELECT 
		@spname = COALESCE(@spname +char(13)+'	, ', '') + concat(A.name,' = ''', A.value ,'''')
	FROM (		
		SELECT name, value
		FROM (values 
			(1, '@con', replace(cast(@con as NVARCHAR(MAX)),'''','''''')),
			(2, '@p', replace(cast(@p as NVARCHAR(MAX)),'''','''''')),
			(1, '--@con', replace(cast([dbo].Base64Decode(@con) as NVARCHAR(MAX)),'''',''''''))
			--(2, '--@p', replace(cast([dbo].Base64Decode(@p) as NVARCHAR(MAX)),'''',''''''))
			) p(num, name, value)
	) AS A(name, value)		
	
	SET @spname=concat('exec [404146_CentralUser].[dbo].',OBJECT_NAME(@@PROCID),' ',@spname)
	DECLARE 
		  @DBNAME as NVARCHAR(50)=''
		, @STATIC_DBNAME as NVARCHAR(50)= ISNULL((select TOP(1) ISNULL(itaskdbname,'') from [404146_centraluser].dbo.inf),'')
		, @appuserid NVARCHAR(100)= '' 
		, @IPAddress NVARCHAR(50)= '' 
		, @FormName NVARCHAR(200)= ''
		, @mode NVARCHAR(100)= ''
		, @id NVARCHAR(50)= ''
		, @y NVARCHAR(100)= ''
		, @Authorization NVARCHAR(100)= ''
		, @domain NVARCHAR(50)= ''
		, @version as NVARCHAR(10)= ''
		, @ForEvt nvarchar(200)=''
		, @token nvarchar(200)=''


	SELECT   @id= iif(ISNULL(element_id,0) = 1,StringValue,@id)
			,@mode= iif(ISNULL(element_id,0) = 2,StringValue,@mode)	
			,@y= iif(ISNULL(element_id,0) = 3,StringValue,@y)	
			,@appuserid= iif(ISNULL(element_id,0) = 4,StringValue,@appuserid)	
			,@IPAddress= iif(ISNULL(element_id,0) = 5,StringValue,@IPAddress)
			,@FormName= iif(ISNULL(element_id,0) = 6,StringValue,@FormName)
			,@Authorization= iif(ISNULL(element_id,0) = 7,StringValue,@Authorization)
			,@domain= iif(ISNULL(element_id,0) = 8,StringValue,@domain)	
			,@version= iif(ISNULL(element_id,0) = 9,StringValue,@version)
	FROM [404146_CentralUser].[dbo].[parseJSON]([dbo].Base64Decode(@con))
	
	SET @token=isnull(@Authorization,'')
	SET @DBNAME = ISNULL([dbo].[GetdbName](@y),'')

----------------------------------------------------------------------------------------------------------------
	DECLARE
		 @SQL NVARCHAR(MAX)= ''
		,@SQLA NVARCHAR(MAX)= ''
		,@SQL1 NVARCHAR(MAX)=''
		,@SQL2 NVARCHAR(MAX)=''
		,@SQL3 NVARCHAR(MAX)=''
		,@SQL4 NVARCHAR(MAX)=''
		,@SQL5 NVARCHAR(MAX)=''
		,@SQL6 NVARCHAR(MAX)=''
		,@SQL7 NVARCHAR(MAX)=''
		,@SQL8 NVARCHAR(MAX)=''
		,@SQL9 NVARCHAR(MAX)=''
		,@SQL10 NVARCHAR(MAX)=''
		,@ARC NVARCHAR(MAX)=''

		,@ProjectID INT = 0
		,@CallLogid INT = 0
		,@EntryDate DATETIME = ''
		,@AppId INT= 0
		,@AppName NVARCHAR(100)= ''
		,@Descr NVARCHAR(MAX) = '' 
		,@CustomerName NVARCHAR(MAX)= ''
		,@Source NVARCHAR(20) = ''
		,@EmpId INT = 0
		,@StatusId INT = 0
		,@Estatus INT = 0
		,@ParentId NVARCHAR(MAX) = ''
		,@PriorityId INT = 0
		,@CreatedBy INT = 0
		,@RatingByCustomer INT = 0
		,@Comments NVARCHAR(MAX) = ''
		,@TicketNo NVARCHAR(MAX) = ''
		,@Feedback NVARCHAR(MAX) = ''
		,@calldetails NVARCHAR(MAX) = ''
		,@DeptId INT = 0
		,@TrainingDate DATE = NULL
		,@TrainingType NVARCHAR(50)= ''
		,@TrainingMode NVARCHAR(50)= ''
		,@TrainingBy NVARCHAR(MAX) = ''
		,@Attendees NVARCHAR(50) = ''
		,@StartTime TIME = NULL
		,@EndTime TIME = NULL
		,@Details NVARCHAR(MAX) = ''
		,@SessionID INT = 0
		,@Filter NVARCHAR(MAX)=''
		,@IssueId INT=0
		,@Satisfaction NVARCHAR(MAX)=''
		,@FilePath NVARCHAR(MAX)=''
		,@OrderDate DATE = ''
		,@TicketDate DATE = ''
		,@CompletionDate DATE = ''
		,@TopicTitle NVARCHAR(MAX)=''
		,@Topictype NVARCHAR(50)=''
		,@EstimatedHours INT = 0
		,@ServiceType NVARCHAR(20)=''
		,@PaymentStatus NVARCHAR(20)=''
		,@StartDate DATE = null
		,@EndDate DATE = null
		,@SearchTerm NVARCHAR(MAX) = ''
		,@Projectcode NVARCHAR(MAX) = ''
		,@Projectname NVARCHAR(MAX) = ''
		,@Code NVARCHAR(MAX)=''
		,@FirstName NVARCHAR(MAX)=''
		,@MiddleName NVARCHAR(MAX)=''
		,@LastName NVARCHAR(MAX)=''
		,@Address NVARCHAR(MAX)=''
		,@MobileNo INT = 0
		,@EmailId NVARCHAR(50)=''
		,@Salary DECIMAL(18,2) = 0
		,@IsClient INT = 0
		,@corporate NVARCHAR(255)=''
		,@CorpId INT = 0
		,@StartDateTime DATETIME = ''
		,@EndDateTime DATETIME = ''
        ,@CallTypeId INT = 0
		,@Page INT=0
		,@PageSize INT=0
		--{D}--
		,@LinkServerName nvarchar(200)=''
		,@UFCC NVARCHAR(100)= ''
		,@SV_DbName nvarchar(200)=''
		,@DeviceId NVARCHAR(100)= ''
		,@SystemLoginId int=0
		,@CustomerBindTypeId int=0
		,@IsInvalidToken int=0
		,@ServerId int=0
		,@domainname as nvarchar(100) =''
		,@LoginMode nvarchar(200)=''
		,@PWD nvarchar(500)=''
		,@Wh nvarchar(max)= 'where 1=0'
		,@LoginID nvarchar(500)=''
		,@LastActionDate datetime=DATEADD(MI,5,@FromDate)
		,@IsEnable int=0
		,@OneSignal_AppId nvarchar(200)=''
		,@OneSignal_SubscriptionId nvarchar(200)=''
		,@OneSignal_OneSignalId nvarchar(200)=''
		,@UserId nvarchar(200)=''
		,@DeviceName NVARCHAR(100)= ''
		,@DeviceType NVARCHAR(100)= ''		
		,@OsVerion NVARCHAR(100)= ''
		,@Brand NVARCHAR(100)= ''
		,@Model NVARCHAR(100)= ''
		,@Manufacturer NVARCHAR(100)= ''
		,@AppVer NVARCHAR(100)= ''
		,@AppVerCode NVARCHAR(100)= ''
		,@LogHistory nvarchar(max)=''
		,@MobileNo1 nvarchar(50) = ''

		,@uKeyFolder nvarchar(MAX)=''		
		,@uKeyFol nvarchar(MAX)=''
		,@uKey as nvarchar(100) =''
		,@cuVer nvarchar(200)=''
		,@dyCcCp nvarchar(200)=''
		,@EmailLogoPath nvarchar(max)=''
		,@ExternalStatusID int = 0
		,@FollowUpCallId int = 0
		,@ResonId int = 0
		,@UserPhone as nvarchar(100) =''
		,@ProjectIds as nvarchar(max) =''
		,@StatusIds as nvarchar(max) =''
		,@CommentId as int

		DECLARE @TBL table
		(
			SystemLoginId int
			,UserId nvarchar(200)
			,MobileNo nvarchar(50)
		)
 		
BEGIN TRY
	BEGIN
		IF (ISNULL(@p,'')<>'')
		BEGIN
			SELECT TOP 1
				@ProjectID  = ISNULL(ProjectID, 0)
				,@CallLogid  = ISNULL(CallLogid, 0)
				,@EntryDate   = ISNULL(EntryDate, null)
				,@AppId  = ISNULL(AppId, 0)
				,@Descr   = ISNULL(Descr, '')
				,@CustomerName  = ISNULL(CustomerName, '')
				,@Source  = ISNULL(Source, '')
				,@EmpId 			 = ISNULL(EmpId, 0)
				,@StatusId = ISNULL(StatusId, 0)
				,@Estatus = ISNULL(Estatus,0)
				,@ParentId  = ISNULL(ParentId, '')
				,@PriorityId	= ISNULL(PriorityId, 0)
				,@CreatedBy  = ISNULL(CreatedBy, 0)
				,@RatingByCustomer = ISNULL(RatingByCustomer, 0)
				,@Comments = ISNULL(Comments,'')
				,@TicketNo = ISNULL(TicketNo,'')
				,@Feedback = ISNULL(Feedback,'')
				,@calldetails = ISNULL(calldetails,'')
				,@DeptId = ISNULL(DeptId,0)
				,@TrainingDate  = ISNULL(TrainingDate,'')
				,@TrainingType  = ISNULL(TrainingType,'' )
				,@TrainingMode  = ISNULL(TrainingMode,'' )
				,@TrainingBy  = ISNULL(TrainingBy,'' )
				,@Attendees  = ISNULL(Attendees,'' )
				,@StartTime  = ISNULL(StartTime,'' )
				,@EndTime  = ISNULL(EndTime,'' )
				,@Details  = ISNULL(Details,'' )
				,@SessionID = ISNULL(SessionID,0)
				,@Filter = ISNULL(Filter,'')
				,@IssueId = ISNULL(IssueId,0)
				,@Satisfaction = ISNULL(Satisfaction,'')
				,@FilePath = ISNULL(FilePath,'')
				,@OrderDate  = ISNULL(OrderDate,'')
				,@TicketDate = ISNULL(TicketDate,'')
				,@CompletionDate = ISNULL(CompletionDate,'')
				,@TopicTitle  = ISNULL(TopicTitle,'')
				,@Topictype  = ISNULL(Topictype,'')
				,@EstimatedHours = ISNULL(EstimatedHours,0)
				,@ServiceType = ISNULL(ServiceType,'')
				,@PaymentStatus = ISNULL(PaymentStatus,'')
				,@StartDate  = ISNULL(StartDate,'')
				,@EndDate  = ISNULL(EndDate,'') 
				,@SearchTerm  = ISNULL(SearchTerm,'')
				,@Projectcode  = ISNULL(Projectcode ,'')
				,@Projectname  = ISNULL(Projectname ,'')
				,@Code = ISNULL(Code ,'')
				,@FirstName  = ISNULL(FirstName ,'')
				,@MiddleName  = ISNULL(MiddleName ,'')
				,@LastName  = ISNULL(LastName ,'')
				,@Address  = ISNULL(Address ,'')
				,@MobileNo  = ISNULL(MobileNo ,0)
				,@EmailId  = ISNULL(EmailId ,'')
				,@Salary  = ISNULL(Salary ,0)
				,@IsClient = ISNULL(IsClient, 0)
				,@corporate = ISNULL(corporate, '')
				,@CorpId = ISNULL(CorpId, 0)
				,@StartDateTime = ISNULL(StartDateTime, '')
				,@EndDateTime = ISNULL(EndDateTime, '')
                ,@CallTypeId = ISNULL(CallTypeId, 0)
				,@Page = ISNULL(Page, 0)
				,@PageSize = ISNULL(PageSize, 0)

				--{D}--
				,@UFCC = ISNULL(UFCC, '')
				,@DeviceId = ISNULL(@DeviceId, '')
				,@LoginMode=isnull(LoginMode,'')
				,@PWD = ISNULL(PWD,'')
				,@LoginID=isnull(LoginID,'')
				,@OneSignal_AppId=isnull(OneSignal_AppId,'')
				,@OneSignal_SubscriptionId=isnull(OneSignal_SubscriptionId,'')
				,@OneSignal_OneSignalId=isnull(OneSignal_OneSignalId,'')
				,@DeviceName=isnull(DeviceName,'')
				,@DeviceType=isnull(DeviceType,'')				
				,@OsVerion=isnull(OsVerion,'')
				,@Brand=isnull(Brand,'')
				,@Model=isnull(Model,'')
				,@Manufacturer=isnull(Manufacturer,'')
				,@AppVer=isnull(AppVer,'')
				,@AppVerCode=isnull(AppVerCode,'')
				,@ExternalStatusID=ISNULL(ExternalStatusID, 0)
				,@FollowUpCallId=ISNULL(FollowUpCallId, 0)
				,@ResonId=ISNULL(ResonId, 0)
				,@UserPhone = ISNULL(UserPhone, '')
				,@ProjectIds = ISNULL(ProjectIds, '')
				,@StatusIds = ISNULL(StatusIds, '')
				,@CommentId = ISNULL(CommentId, 0)

			FROM OPENJSON(ISNULL(@p,''))
			WITH 
			(
				ProjectID INT '$.ProjectID'
				,CallLogid INT '$.CallLogid'
				,EntryDate DATETime '$.EntryDate'
				,AppId INT '$.AppId'
				,Descr NVARCHAR(MAX) '$.Descr'
				,CustomerName NVARCHAR(MAX) '$.CustomerName'
				,Source NVARCHAR(20) '$.Source'
    			,EmpId INT '$.EmpId'			
				,StatusId INT '$.StatusId'
				,Estatus INT '$.Estatus'
				,ParentId NVARCHAR(MAX) '$.ParentId'
				,PriorityId INT '$.PriorityId'
				,CreatedBy INT '$.CreatedBy'
				,RatingByCustomer INT '$.RatingByCustomer'
				,Comments NVARCHAR(MAX) '$.Comments'
				,TicketNo  NVARCHAR(MAX) '$.TicketNo'
				,Feedback NVARCHAR(MAX) '$.Feedback'
				,calldetails NVARCHAR(MAX) '$.calldetails'
				,DeptId INT '$.DeptId'
				,TrainingDate DATE '$.TrainingDate'
				,TrainingType NVARCHAR(50) '$.TrainingType'
				,TrainingMode NVARCHAR(50) '$.TrainingMode'
				,TrainingBy NVARCHAR(50) '$.TrainingBy'
				,Attendees NVARCHAR(MAX) '$.Attendees'
				,StartTime TIME '$.StartTime'
				,EndTime TIME '$.EndTime'
				,Details NVARCHAR(MAX) '$.Details'
				,SessionID INT '$.SessionID'
				,Filter NVARCHAR(MAX) '$.Filter'
				,IssueId INT  '$.IssueId'
				,Satisfaction NVARCHAR(MAX) '$.Satisfaction'
				,FilePath NVARCHAR(MAX) '$.FilePath'
				,OrderDate DATE '$.OrderDate'
				,TicketDate DATE '$.TicketDate'
				,CompletionDate DATE '$.CompletionDate'
				,TopicTitle NVARCHAR(MAX) '$.TopicTitle'
				,Topictype NVARCHAR(MAX) '$.Topictype'
				,EstimatedHours INT '$.EstimatedHours'
				,ServiceType NVARCHAR(MAX) '$.ServiceType'
				,PaymentStatus NVARCHAR(MAX) '$.PaymentStatus'
				,StartDate DATE '$.StartDate'
				,EndDate DATE '$.EndDate'
				,SearchTerm NVARCHAR(MAX) '$.SearchTerm'
				,Projectcode NVARCHAR(MAX) '$.Projectcode'
				,Projectname NVARCHAR(MAX) '$.Projectname'
				,Code NVARCHAR(MAX) '$.Code'
				,FirstName NVARCHAR(MAX) '$.FirstName'
				,MiddleName NVARCHAR(MAX) '$.MiddleName'
				,LastName NVARCHAR(MAX) '$.LastName'
				,Address NVARCHAR(MAX) '$.Address'
				,MobileNo INT  '$.MobileNo'
				,EmailId NVARCHAR(50) '$.EmailId'
				,Salary DECIMAL(18,2) '$.Salary'
				,IsClient INT '$.IsClient'
				,corporate NVARCHAR(255) '$.corporate'
				,CorpId INT '$.CorpId'
				,StartDateTime DATETIME '$.StartDateTime'
				,EndDateTime DATETIME '$.EndDateTime'
                ,CallTypeId INT '$.CallTypeId'
				,Page INT '$.Page'
				,PageSize INT '$.PageSize'

				--{D}--
				,UFCC NVARCHAR(100) '$.Ufcc'
				,DeviceId NVARCHAR(100) '$.DeviceId'
				,LoginMode nvarchar(200) '$.LoginMode'
				,PWD NVARCHAR(500) '$.PWD'
				,LoginID nvarchar(500) '$.LoginID'
				,OneSignal_AppId nvarchar(200) '$.OneSignal_AppId'
				,OneSignal_SubscriptionId nvarchar(200) '$.OneSignal_SubscriptionId'
				,OneSignal_OneSignalId nvarchar(200) '$.OneSignal_OneSignalId'
				,DeviceName NVARCHAR(100) '$.DeviceName'
				,DeviceType NVARCHAR(100) '$.DeviceType'
				,OsVerion NVARCHAR(100) '$.OsVerion'
				,Brand NVARCHAR(100) '$.Brand'
				,Model NVARCHAR(100) '$.Model'
				,Manufacturer NVARCHAR(100) '$.Manufacturer'
				,AppVer NVARCHAR(100) '$.AppVer'
				,AppVerCode NVARCHAR(100) '$.AppVerCode'
				,ExternalStatusID INT '$.ExternalStatusID'
				,FollowUpCallId INT '$.FollowUpCallId'
				,ResonId INT '$.ResonId'
				,UserPhone nvarchar(100) '$.UserPhone'
				,ProjectIds nvarchar(max) '$.ProjectIds'
				,StatusIds nvarchar(max) '$.StatusIds'
				,CommentId INT '$.CommentId'
			) AS a
		END

		PRINT CONCAT('@ProjectID :' , @ProjectID)			
		PRINT CONCAT('@CallLogid :' , @CallLogid)		
		PRINT CONCAT('@EntryDate :' , @EntryDate)         
		PRINT CONCAT('@AppId :' , @AppId)             
		PRINT CONCAT('@Descr :' , @Descr)	
		PRINT CONCAT('@CustomerName :' , @CustomerName)      
	    PRINT CONCAT('@Source :' , @Source)     
		PRINT CONCAT('@EmpId :' , @EmpId) 		    
		PRINT CONCAT('@StatusId :' , @StatusId)       
		PRINT CONCAT('@ParentId :' , @ParentId)          
		PRINT CONCAT('@PriorityId :' , @PriorityId)     
		PRINT CONCAT('@Estatus :' , @Estatus)		      
		PRINT CONCAT('@CreatedBy :' , @CreatedBy)  
	    PRINT CONCAT('@RatingByCustomer :' , @RatingByCustomer)
		PRINT CONCAT('@Comments :' , @Comments)
		PRINT CONCAT('@TicketNo :' , @TicketNo)
		PRINT CONCAT('@Feedback :' , @Feedback)
		PRINT CONCAT('@calldetails :' , @calldetails)
		PRINT CONCAT('@DeptId :' , @DeptId)
		PRINT CONCAT('@TrainingDate :' , @TrainingDate)
		PRINT CONCAT('@TrainingType :' , @TrainingType)
		PRINT CONCAT('@TrainingMode :' , @TrainingMode)
		PRINT CONCAT('@TrainingBy :' , @TrainingBy)
    	PRINT CONCAT('@Attendees :' , @Attendees)
		PRINT CONCAT('@StartTime :' , @StartTime)
		PRINT CONCAT('@EndTime :' , @EndTime)
		PRINT CONCAT('@Details :' , @Details)
		PRINT CONCAT('@SessionID :' , @SessionID)
		PRINT CONCAT('@Filter :' , @Filter)
		PRINT CONCAT('@IssueId :' , @IssueId)
		PRINT CONCAT('@Satisfaction :'  ,@Satisfaction)
		PRINT CONCAT('@OrderDate :'		,@OrderDate)		
		PRINT CONCAT('@TicketDate :'	,@TicketDate)	
		PRINT CONCAT('@CompletionDate :',@CompletionDate)
		PRINT CONCAT('@TopicTitle :'	,@TopicTitle)	
		PRINT CONCAT('@Topictype :'		,@Topictype	)	
		PRINT CONCAT('@EstimatedHours :',@EstimatedHours)
		PRINT CONCAT('@ServiceType :'	,@ServiceType)	
		PRINT CONCAT('@PaymentStatus :'	,@PaymentStatus)
		PRINT CONCAT('@StartDates :'	,@StartDate)
		PRINT CONCAT('@EndDate :'	    ,@EndDate)
		PRINT CONCAT('@SearchTerm :' , @SearchTerm)
		PRINT CONCAT('@Projectcode : ',@Projectcode)
		PRINT CONCAT('@Projectname : ',@Projectname)
		PRINT CONCAT('@Code	: ',@Code)
		PRINT CONCAT('@FirstName : ',@FirstName)
		PRINT CONCAT('@MiddleName : ',@MiddleName)
		PRINT CONCAT('@LastName : ',@LastName)
		PRINT CONCAT('@Address : ',@Address)
		PRINT CONCAT('@MobileNo : ',@MobileNo)
		PRINT CONCAT('@EmailId : ',@EmailId)
		PRINT CONCAT('@Salary : ',@Salary)
		PRINT CONCAT('@IsClient :', @IsClient)
		PRINT CONCAT('@corporate :', @corporate)
		PRINT CONCAT('@CorpId :', @CorpId)
		PRINT CONCAT('@StartDateTime :', @StartDateTime)
		PRINT CONCAT('@EndDateTime :', @EndDateTime)
        PRINT CONCAT('@CallTypeId :', @CallTypeId)
		PRINT CONCAT('@Page :', @Page)
		PRINT CONCAT('@PageSize :', @PageSize)
		PRINT CONCAT('@mode :',@mode)

		----{D}--
		PRINT CONCAT('@LinkServerName :', @LinkServerName)
		PRINT CONCAT('@UFCC :', @UFCC)
		PRINT CONCAT('@SV_DbName :', @SV_DbName)
		PRINT CONCAT('@DeviceId :', @DeviceId)
		PRINT CONCAT('@SystemLoginId :', @SystemLoginId)
		PRINT CONCAT('@CustomerBindTypeId :', @CustomerBindTypeId)
		PRINT CONCAT('@IsInvalidToken :', @IsInvalidToken)
		PRINT CONCAT('@ServerId :', @ServerId)
		PRINT CONCAT('@domainname :', @domainname)
		PRINT CONCAT('@LoginMode :', @LoginMode)
		PRINT CONCAT('@IsInvalidToken :', @IsInvalidToken)
		PRINT CONCAT('@PWD :', @PWD)
		PRINT CONCAT('@LoginID :', @LoginID)
		PRINT CONCAT('@LastActionDate :', @LastActionDate)
		PRINT CONCAT('@IsEnable :', @IsEnable)
		PRINT CONCAT('@OneSignal_AppId :', @OneSignal_AppId)
		PRINT CONCAT('@OneSignal_SubscriptionId :', @OneSignal_SubscriptionId)
		PRINT CONCAT('@OneSignal_OneSignalId :', @OneSignal_OneSignalId)
		PRINT CONCAT('@UserId :', @UserId)
		PRINT CONCAT('@DeviceName :', @DeviceName)
		PRINT CONCAT('@DeviceType :', @DeviceType)
		PRINT CONCAT('@OsVerion :', @OsVerion)
		PRINT CONCAT('@Brand :', @Brand)
		PRINT CONCAT('@Model :', @Model)
		PRINT CONCAT('@Manufacturer :', @Manufacturer)
		PRINT CONCAT('@AppVer :', @AppVer)
		PRINT CONCAT('@AppVerCode :', @AppVerCode)
		PRINT CONCAT('@ExternalStatusID :', @ExternalStatusID)
		PRINT CONCAT('@FollowUpCallId :', @FollowUpCallId)
		PRINT CONCAT('@ResonId :', @ResonId)
		PRINT CONCAT('@UserPhone :', @UserPhone)
		PRINT CONCAT('@ProjectIds :', @ProjectIds)
		PRINT CONCAT('@StatusIds :', @StatusIds)
	END

	set @AppName='Optigo Support'

	IF (@mode not in ('DeviceRegister','LoginWithPWD'))
	BEGIN
		select top 1
			@LinkServerName=isnull(b.LinkServerName,'')
			,@DbName=isnull(DbName,'')
			,@UFCC=UFCC
			,@SV_DbName=iif(isnull(b.LinkServerName,'')='',concat('[',DbName,'].[dbo].'),concat('[',b.LinkServerName,'].[',DbName,'].[dbo].'))
			,@DeviceId=DeviceId
			,@SystemLoginId=SystemLoginId
			,@CustomerBindTypeId=CustomerBindTypeId
			,@AppId=AppId
			,@AppName=AppName
		from
		(
			select	
				ServerId
				,DbName
				,UFCC
				,DeviceId
				,SystemLoginId
				,DeviceToken
				,CustomerBindTypeId
				,AppId
				,AppName
			from Appmanagement_Device with (NoLock)
			where DeviceToken=@token
		) as a
		left outer join (Select serverid,LinkServerName from LinkServerList with (NoLock)) as b
			on a.ServerId=b.serverid
		if(isnull(@DbName,'')='')
		begin
			set @IsInvalidToken=1
		end
		print concat('--@DbName:',@DbName)
		print concat('--@IsInvalidToken:',@DbName)
	END
	
	IF (@IsInvalidToken=1)
	BEGIN
		select  
			 0 as stat
			,'Invalid Token' as stat_msg
			,1111 as stat_code
			,1111 as stat_codesdfs
	END 
	ELSE IF (@mode in ('LoginWithPWD'))
	BEGIN
		Print concat('--@UFCC:',@UFCC)	
		select top 1 
			@DbName=isnull(dbname,'') 		
			,@UFCC =isnull([UFCC],'')
			,@ServerId=isnull(a.serverid,0)
			,@SV_DbName=iif(isnull(b.LinkServerName,'')='',concat('[',dbname,'].[dbo].'),concat('[',LinkServerName,'].[',dbname,'].[dbo].'))
			,@domainname=domainname
		from
		(
			select dbname,[UFCC],serverid,domainname
			from [404146_CentralUser].[dbo].databasemanagement_SwitchToSample_permission as a with(nolock)
			where UFCC=@UFCC
			--where dbUniqueKey=@Token
		) as a
		left outer join (
					Select serverid,LinkServerName 
					from LinkServerList with (NoLock)
				) as b
			on a.ServerId=b.serverid

	
		if(isnull(@DbName,'')<>'')
		begin
			set @SystemLoginId=0	
			
			if(@LoginMode='email')
			begin
				set @Wh='
				where userid='''+replace(cast(isnull(@LoginID,'') as NVARCHAR(MAX)),'''','''''')+'''
					and [password]='''+replace(cast(isnull(@PWD,'') as NVARCHAR(MAX)),'''','''''')
					+'''
				'
			end
			else if(@LoginMode='mobile')
			begin
				set @Wh='
					where replace(mobile,''-'','''')='''+replace(cast(replace(isnull(@LoginID,''),'-','') as NVARCHAR(MAX)),'''','''''')+'''
						and [password]='''+replace(cast(isnull(@PWD,'') as NVARCHAR(MAX)),'''','''''')
						+'''
				'
			end

			set @SQL='
				select 
					id as SystemLoginId
					,userid
					,mobile as MobileNo
				from '+@SV_DbName+'corp_cust with(nolock)
				'+@Wh+'
					-- and IsActive=1
			'
			print (@SQL)
				
			insert into @TBL
				(SystemLoginId,UserId,MobileNo)
			EXEC(@SQL)

			select top 1 
				@SystemLoginId=SystemLoginId
				,@UserId=UserId
				,@MobileNo1=MobileNo
			from @TBL

			if(@SystemLoginId=0)
			begin
				select 
					0 as stat
					,case when @LoginMode='email' then 'Invalid EmailId/PassWord'
						when @LoginMode='mobile' then 'Invalid MobileNo/PassWord' 
						else 'Invalid'
						end as stat_msg
					,1008 as stat_code	
			end
			else
			begin
				if exists (select 1 from Appmanagement_Device with (NoLock) 
					where AppId=@AppId and [dbName]=@DbName and [deviceID]<>@DeviceId
						and SystemLoginId=@SystemLoginId)
				begin
					select 
						0 as stat
						,case when @LoginMode='email' then 'EmailId Already Connected With Other Device.'
							when @LoginMode='mobile' then 'MobileNo Already Connected With Other Device.'
							else 'Already Connected With Other Device.'
							end as stat_msg
						,1008 as stat_code	
				end
				else
				begin			
					declare @uniquenoCount as int = 1
						,@index int=0
						,@uniquenoMsg as nvarchar(max)=''
						,@pool varchar(100)= ''
						,@counter int=1
						,@pos int=0

					while @index < @uniquenoCount
					begin
						set @token =''			
						set @pool= '1234567890ABCDEFGHIJKLMNPQRSTUVWXYZ1234567890'
						set @counter =1
						set @pos =0
	
						while @counter <= 16
						begin								
							set @pos = ceiling(rand()*(len(@pool)))
							set @token = isnull(@token, '') + substring(@pool, @pos, 1) 				
							set @counter = @counter + 1
						end			

						if exists(
							select top 1 [id] 
							from Appmanagement_Device with(nolock) 
							where [deviceID]=@DeviceId
								and [dbName]=@DbName
								and ufcc=@UFCC
								and AppId=@AppId
								and SystemLoginId=0)
						begin
							Print '--1'
							update a
								set SystemLoginId=@SystemLoginId
									,DeviceToken=@token
									,LoginDate=@FromDate
									,LastActionDate=@LastActionDate
									,@IsEnable=IsEnable
									,@CustomerBindTypeId=CustomerBindTypeId
							from Appmanagement_Device as a with (RowLock)
							where [deviceID]=@DeviceId
								and [dbName]=@DbName
								and ufcc=@UFCC
								and AppId=@AppId
								and SystemLoginId=0
						
							if exists (
								select 1 from [onesignallist] with (NoLock) 
								where [device_token]=@token
								and AppId=@AppId)
							begin
								update a
									set userid=@UserId
										,mobileno=@MobileNo1
										,onesignal_uid=@OneSignal_AppId
										,onesignal_SubPlayid=@OneSignal_SubscriptionId
										,onesignal_OneSigId=@OneSignal_OneSignalId
										,SystemLoginid=@SystemLoginId
								from [onesignallist] as a with (NoLock)
								where [device_token]=@token
									and AppId=@AppId
							end
							else
							begin
								INSERT INTO [onesignallist]
								(
									[entrydate],[device_token],[onesignal_uid]
									,[deviceid],[dbname],[eventname],onesignal_SubPlayid,onesignal_OneSigId
									,AppId,userid,mobileno,SystemLoginid
								)
								values
								(
									@FromDate,@token,@OneSignal_AppId
									,@DeviceId,@DbName,concat(@mode,'-',@LoginMode),@OneSignal_SubscriptionId,@OneSignal_OneSignalId
									,@AppId,@UserId,@MobileNo1,@SystemLoginid
								)
							end
						end
						else if not exists(
							select top 1 [id] 
							from Appmanagement_Device with(nolock) 
							where [deviceID]=@DeviceId
								and [dbName]=@DbName
								and ufcc=@UFCC
								and AppId=@AppId
								and SystemLoginId=@SystemLoginId
						)
						begin
							Print '--2'
							set @CustomerBindTypeId=1
							insert into Appmanagement_Device
							(
								Entrydate,DeviceId,DeviceName,DeviceType,DeviceToken,UFCC,DbName,OsVerion
								,Brand,Model,Manufacturer,AppVer,AppVerCode,AppId,AppName,ServerId
								,IsEnable,SystemLoginId,ExpiryDate,LoginDate,CustomerBindTypeId,LastActionDate
							)
							values
							(
								@FromDate,ltrim(rtrim(isnull(@DeviceId,''))),@DeviceName,@DeviceType,@token,@UFCC,@DbName,@OsVerion
								,@Brand,@Model,@Manufacturer,@AppVer,@AppVerCode,@AppId,@AppName,@ServerId
								,1,@SystemLoginId,DATEADD(YEAR,1,@FromDate),@FromDate
								,@CustomerBindTypeId,@LastActionDate
							)

							INSERT INTO [onesignallist]
							(
								[entrydate],[device_token],[onesignal_uid]
								,[deviceid],[dbname],[eventname],onesignal_SubPlayid,onesignal_OneSigId
								,AppId,userid,mobileno,SystemLoginid
							)
							values
							(
								@FromDate,@token,@OneSignal_AppId
								,@DeviceId,@DbName,concat(@mode,'-',@LoginMode),@OneSignal_SubscriptionId,@OneSignal_OneSignalId
								,@AppId,@UserId,@MobileNo1,@SystemLoginid
							)

							exec AppManagement_LogHistory_Save @AppId,@AppName,@DbName,@mode,@SystemLoginId,@LogHistory,@SystemLoginId,@IPAddress

						end
						else
						begin
							Print concat('--@SystemLoginId:',@SystemLoginId)
							select top 1
								@token=isnull(DeviceToken,'')
								,@IsEnable=IsEnable
								,@CustomerBindTypeId=CustomerBindTypeId
							from Appmanagement_Device with(nolock)
							where [deviceID]=@DeviceId
								and [dbName]=@DbName
								and ufcc=@UFCC
								and AppId=@AppId
								and SystemLoginId=@SystemLoginId
						end
						set @index = @index + 1
					end
				
					SET @SQL2='							
						DECLARE @Socket_URL nvarchar(500)=''http://192.168.1.153/optiogo-backend''
							,@Socket_Address nvarchar(500)=''''
							,@Socket_Path nvarchar(500)=''/connect_socket_react/socket.io''
							,@domainname nvarchar(500)='''+@domainname+'''
						
						if (@domainname not in (''zen'',''Nzen''))
						begin
							select top 1
								@Socket_URL=isnull(Socket_Address,'''')
								,@Socket_Address=isnull(Socket_Address,'''')
								,@Socket_Path=isnull(Socket_Path,'''')
							from
							(
								select [value]
									,[key] as columnname
								from '+@SV_DbName+'[WebConfig] with (NoLock)
							) d
							pivot
							(
								max([value])
								for columnname in (Socket_URL, Socket_Address, Socket_Path)
							) piv;
						end

						select
							1 as stat
							,''success'' as stat_msg
							,''1001'' as stat_code
							,'''+isnull(@token,'')+''' as DeviceToken
							,'''+isnull(@UFCC,'')+''' as Ufcc
							,@Socket_URL as Socket_URL
							,@Socket_Address as Socket_Address
							,@Socket_Path as Socket_Path
							,'+convert(varchar(20),isnull(@IsEnable,0))+' as IsEnable
							,'''+convert(varchar,DATEADD(YEAR,1,@FromDate),20)+''' as ExpiryDate
							,'+convert(varchar(20),isnull(@CustomerBindTypeId,0))+' as CustomerBindTypeId
							,'+convert(varchar(20),isnull(@ServerId,0))+' as SV
					'
					print (@SQL2)
					exec (@SQL2)
				end
			end
		end
		else
		begin
			select 
				0 as stat
				,'Invalid Compnay Code' as stat_msg
				,1008 as stat_code			
		END
	END 
	ELSE IF (@mode in ('LogOut'))
	BEGIN
		Print '--'

		update a
			set SystemLoginId=0
				,LoginDate=NULL
				,LastActionDate=NULL
		from Appmanagement_Device as a with (NoLock)
		where DeviceToken=@token
			and AppId=@AppId
	
		set @SQL1='
			update a
					set EndDateTime=@FromDate
					,IsLast=0
			from '+@SV_DbName+'EvoManagement_CustomerSession as a with (NoLock)
			where DeviceLoginId='+convert(varchar(10),isnull(@SystemLoginId,0))+'
				and EndDateTime is null 
				and StartDateTime is not null
		'
		

		--EndDateTime	from Appmanagement_Device as a with (NoLock)
		--where DeviceToken=@token
		--	and AppId=@AppId

		
		select
			1 as stat
			,'success' as stat_msg
			,'SuccessFully LogOut.' as [Msg]
			,'1001' as stat_code

	END
	ELSE IF (@mode='DeleteAccount')
	BEGIN
	
		delete from Appmanagement_Device
		where DeviceToken=@token
			and AppId=@AppId

		select
			1 as stat
			,'success' as stat_msg
			,'Your account deletion request has been received. It may take up to 30 days to complete.' as [Msg]
			,'1001' as stat_code

	END
	ELSE IF (@mode in ('DeviceStatus'))
	BEGIN
		declare @Socket_URL nvarchar(500)='http://192.168.1.153/optiogo-backend'
				,@Socket_Address nvarchar(500)=''
				,@Socket_Path nvarchar(500)='/connect_socket_react/socket.io'

		if(isnull(@domainname,'')<>'')
		begin

			SET @SQL1='
				declare @domainname nvarchar(500)='''+@domainname+'''
				set @Socket_URL=''http://192.168.1.153/optiogo-backend''
				set @Socket_Address nvarchar(500)=''''
				set @Socket_Path nvarchar(500)=''/connect_socket_react/socket.io''
					
				if (@domainname not in (''zen'',''Nzen''))
				begin
					select top 1
						@Socket_URL=isnull(Socket_Address,'''')
						,@Socket_Address=isnull(Socket_Address,'''')
						,@Socket_Path=isnull(Socket_Path,'''')
					from
					(
						select [value]
							,[key] as columnname
						from '+@SV_DbName+'[WebConfig] with (NoLock)
					) d
					pivot
					(
						max([value])
						for columnname in (Socket_URL, Socket_Address, Socket_Path)
					) piv;
				end
			'
			exec sp_executesql @SQL1,N'
				@Socket_URL nvarchar(500) OUTPUT
				,@Socket_Address nvarchar(500) OUTPUT
				,@Socket_Path nvarchar(500) OUTPUT
					'
				,@Socket_URL OUTPUT
				,@Socket_Address OUTPUT
				,@Socket_Path OUTPUT

		end
		
		select
			1 as stat
			,'success' as stat_msg		
			,'1001' as stat_code
			,UFCC
			,isnull(IsEnable,0) as IsEnable
			,convert(varchar,a.ExpiryDate,20) as ExpiryDate
			,isnull(SystemLoginId,0) as SystemLoginId
			,isnull(CustomerBindTypeId,0) as CustomerBindTypeId
			,@Socket_URL as Socket_URL
			,@Socket_Address as Socket_Address
			,@Socket_Path as Socket_Path
		from Appmanagement_Device as a with (NoLock)
		where DeviceToken=@token
			and AppId=@AppId
	END
	ELSE IF(ISNULL(@mode,'')='gettoken')
	BEGIN
		SET @SQL='
				DECLARE @CustUserId NVARCHAR(255);
				DECLARE @CustId INT = 0;
				DECLARE @companycode as nvarchar(200)=''''

				IF('''+  @corporate +''' = ''true'')
				BEGIN
					SELECT 
						@CustUserId = usa.userid
					FROM ['+@DBNAME+'].dbo.corp_cust AS cc WITH(NOLOCK)
					LEFT JOIN ['+@DBNAME+ '].dbo.[usermanagement_systemloginmaster] AS usa WITH(NOLOCK)	
					ON cc.custid = usa.id
					WHERE cc.userid='''+@appuserid+'''

					SELECT TOP(1)
						@companycode=customercode
						,@CustId = id
					FROM ['+@DBNAME+'].dbo.usermanagement_systemloginmaster WITH(NOLOCK)
					WHERE userid=@CustUserId
				END
				ELSE
				BEGIN
					SET @CustUserId = '''+@appuserid+'''

					SELECT TOP(1)
						@companycode=companycode
					FROM [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission WITH(NOLOCK)
					WHERE dbname='''+@DBNAME+'''

					SELECT TOP(1)
						@CustId = id
					FROM ['+@DBNAME+'].dbo.usermanagement_systemloginmaster WITH(NOLOCK)
					WHERE userid='''+@appuserid+'''

				END

				SELECT 
	        		dbUniqueKey  as token
					,id AS companyId
	        		,ISNULL(ukey,'''')  as ukey
					,serverid as sv
	        		,''https://cdnfs.optigoapps.com/content-global3'' as url_path
	        		,@companycode as companycode
				FROM [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission WITH(NOLOCK)
				WHERE dbname='''+@DBNAME+'''


				SELECT TOP(1) id
	        		,ISNULL(firstname,'''') as firstname
	        		,ISNULL(lastname,'''') as lastname
	        		,ISNULL(customercode,'''') as customercode
	        		,ISNULL(firmname,'''') as firmname
	        		,ISNULL(designation,'''') as designation
					,iif(isnull(mastermanagement_roleid,0)=3
						,iif(ISNULL(designation,'''')=''admin'',1,2)
						,isnull(mastermanagement_roleid,0))
						as roleid
					,iif(isnull(mastermanagement_roleid,0)=3
						,iif(ISNULL(designation,'''')=''admin'',''admin'',''employee'')
						,'''')
						as role
				FROM ['+@DBNAME+'].dbo.usermanagement_systemloginmaster WITH(NOLOCK)
				WHERE userid=@CustUserId

				SELECT TOP(1) id
					,ISNULL(custid, '''') as custid
	        		,ISNULL(firstname,'''') as firstname
	        		,ISNULL(lastname,'''') as lastname
	        		,ISNULL(usercode,'''') as customercode
					,isnull(userid, '''') as userid
				FROM ['+@DBNAME+'].dbo.corp_cust WITH(NOLOCK)
				WHERE userid='''+@appuserid+'''

				SELECT
					id
					,title as pagename 
				FROM ['+@DBNAME+'].[dbo].usermanagement_role_pages WITH (NOLOCK)
				WHERE id in (
					SELECT
						ISNULL([usermanagement_role_pagesid],0)
					FROM ['+@DBNAME+'].[dbo].[UserManagement_UserRightsBinding] WITH (NOLOCK)
					WHERE Usermanagement_systemloginmasterid=@CustId
					AND appsname=''TASKMGT''
					AND (ISNULL(''' + @corporate + ''', '''') = '''')
				)
		'

		PRINT (@SQL)
		EXEC (@SQL)
	END
	ELSE IF(ISNULL(@mode,'')='gettoken_corp')
	BEGIN
		SET @SQL='
				DECLARE @CustUserId NVARCHAR(255);
				DECLARE @CustId INT = 0;
				DECLARE @companycode as nvarchar(200)=''''

				
				SELECT 
					@CustUserId = usa.userid
				FROM [' + @STATIC_DBNAME + '].dbo.corp_cust AS cc WITH(NOLOCK)
				LEFT JOIN [' + @STATIC_DBNAME + '].dbo.[usermanagement_systemloginmaster] AS usa WITH(NOLOCK)	
				ON cc.custid = usa.id
				WHERE cc.id='+convert(nvarchar(50),@SystemLoginId)+'

				SELECT TOP(1)
					@companycode=customercode
					,@CustId = id
				FROM [' + @STATIC_DBNAME + '].dbo.usermanagement_systemloginmaster WITH(NOLOCK)
				WHERE userid=@CustUserId
				

				SELECT 
	        		dbUniqueKey  as token
					,id AS companyId
	        		,ISNULL(ukey,'''')  as ukey
					,serverid as sv
	        		,''https://cdnfs.optigoapps.com/content-global3'' as url_path
	        		,@companycode as companycode
					,[404146_centraluser].dbo.Base64Encode(concat(''{{'',domainname,''}}{{'',yearname,''}}{{'',companycode,''}}{{'',company_password,''}}'')) as yc
				FROM [404146_CentralUser].dbo.databasemanagement_SwitchToSample_permission WITH(NOLOCK)
				WHERE dbname=''' + @STATIC_DBNAME + '''


				SELECT TOP(1) id
	        		,ISNULL(firstname,'''') as firstname
	        		,ISNULL(lastname,'''') as lastname
	        		,ISNULL(customercode,'''') as customercode
	        		,ISNULL(firmname,'''') as firmname
	        		,ISNULL(designation,'''') as designation
					,iif(isnull(mastermanagement_roleid,0)=3
						,iif(ISNULL(designation,'''')=''admin'',1,2)
						,isnull(mastermanagement_roleid,0))
						as roleid
					,iif(isnull(mastermanagement_roleid,0)=3
						,iif(ISNULL(designation,'''')=''admin'',''admin'',''employee'')
						,'''')
						as role
				FROM [' + @STATIC_DBNAME + '].dbo.usermanagement_systemloginmaster WITH(NOLOCK)
				WHERE userid=@CustUserId

				SELECT TOP(1) id
					,ISNULL(custid, '''') as custid
	        		,ISNULL(firstname,'''') as firstname
	        		,ISNULL(lastname,'''') as lastname
	        		,ISNULL(usercode,'''') as customercode
					,isnull(userid, '''') as userid
				FROM [' + @STATIC_DBNAME + '].dbo.corp_cust WITH(NOLOCK)
				WHERE id='+convert(nvarchar(50),@SystemLoginId)+'

				--SELECT
				--	id
				--	,title as pagename 
				--FROM ['+@DBNAME+'].[dbo].usermanagement_role_pages WITH (NOLOCK)
				--WHERE id in (
				--	SELECT
				--		ISNULL([usermanagement_role_pagesid],0)
				--	FROM ['+@DBNAME+'].[dbo].[UserManagement_UserRightsBinding] WITH (NOLOCK)
				--	WHERE Usermanagement_systemloginmasterid=@CustId
				--	AND appsname=''TASKMGT''
				--	AND (ISNULL(''' + @corporate + ''', '''') = '''')
				--)
		'

		PRINT (@SQL)
		EXEC (@SQL)
	END
	ELSE IF(ISNULL(@mode,'')= 'CALLQUEUE')
	BEGIN
			SET @SQL = '
				SELECT 
					 c.CallLogId AS sr
					,c.EntryDate AS date
					,u.customercode AS company
					,c.CustomerName AS callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr, '''') AS description
					,CASE 
						WHEN ISNULL(c.createdby, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						))
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname, '''') AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name, '''') AS status
					,ISNULL(s2.Name, '''') AS Estatus
					,ISNULL(c.Feedback, '''') AS feedback
					,ISNULL(c.RatingByCustomer, 0) AS rating
					,c.Source AS topicRaisedBy
					,ISNULL(p.Name, '''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed
				   ';
		
			SET @SQL1 = '
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
							 ), ''00:00:00''), 108), 
					'''') AS CallDuration
					,ISNULL(c.CallDetails, '''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
					,MAX(ISNULL(cr.Satisfaction, '''')) AS Satisfaction
					,MAX(ISNULL(cr.Comments, '''')) AS review_comments
					,ISNULL(REPLACE(
						   (
							 SELECT 
								  md.Id AS dept_id
								 ,ISNULL(md.Designationname, '''') AS dept_name
								 ,ci.IssueId AS issue_id
								 ,ISNULL(ci.Issues, '''') AS issue_name
							 FROM ['+@DBNAME+'].dbo.[CallLog_Review_Form] cr WITH (NOLOCK)
							 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md WITH (NOLOCK) 
								  ON md.id = cr.DeptId
							 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Review_Issues] ci WITH (NOLOCK) 
								  ON cr.IssueId = ci.IssueId
							 WHERE cr.CallLogId = c.CallLogId
							 FOR JSON PATH
						   ),''\/'', ''/''), '''') AS review_dept_issue_list		       
					,ISNULL(c.ParentId, '''') AS parentId
		
				FROM [' + @DBNAME + '].dbo.[CallLog] c WITH(NOLOCK)		    
				INNER JOIN [' + @DBNAME + '].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)	
					  ON c.ProjectID = u.id
				LEFT JOIN [' + @DBNAME + '].dbo.[CallLog_AppName] A WITH(NOLOCK)	
					 ON c.AppId = A.AppId
				LEFT JOIN [' + @DBNAME + '].dbo.[CallLog_status] s1 WITH(NOLOCK)	
					 ON c.InternalStatusID = s1.StatusID
				LEFT JOIN [' + @DBNAME + '].dbo.[CallLog_status] s2 WITH(NOLOCK)	
					 ON c.ExternalStatusID = s2.StatusID
				LEFT JOIN [' + @DBNAME + '].dbo.[CallLog_Priority] p WITH(NOLOCK)	
					 ON c.Priorityid = p.Priorityid
				LEFT JOIN [' + @DBNAME + '].dbo.[CallLog_Tickets] t WITH(NOLOCK)	
					 ON c.CallLogId = t.CallLogId
				LEFT JOIN [' + @DBNAME + '].dbo.[CallLog_Review_Form] cr WITH(NOLOCK)	
					 ON cr.CallLogId = c.CallLogId
				LEFT JOIN [' + @DBNAME + '].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)	
					 ON md1.id = c.DeptId
				LEFT JOIN [' + @DBNAME + '].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK)	 
					 ON c.EmpId = e.id
				LEFT JOIN [' + @DBNAME + '].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK)	 
					 ON c.createdby = e1.id
				WHERE c.IsActive = 1 AND c.CreatedBy = 0
			';
			 			     				
				SET @SQL2 = ' 
				GROUP BY 
					 c.CallLogId 
					,c.EntryDate 
					,u.customercode 
					,c.CustomerName 
					,ISNULL(A.appname,'''')
					,ISNULL(c.Descr, '''')
					,FORMAT(c.CreatedDate, ''HH:mm'')
					,ISNULL(e.firstname,'''') 
					,ISNULL(e.middlename,'''')
					,e.middlename
					,ISNULL(e.lastname,'''')
					,ISNULL(s1.Name,'''') 
					,ISNULL(s2.Name,'''')
					,ISNULL(c.Feedback,'''') 
					,ISNULL(c.RatingByCustomer, 0)
					,ISNULL(e1.firstname, '''') 
					,ISNULL(e1.middlename, '''')
					,e1.middlename
					,ISNULL(e1.lastname, '''')
					,c.Source 
					,ISNULL(p.Name,'''')
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') 
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''')
					,ISNULL(c.CallDetails, '''')
					,ISNULL(t.TicketNo, '''')
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''')
					,c.TotalPausedTime		   
					,c.createdby 
					,c.ParentId 
					,c.EmpId 
					,ISNULL(c.createdby, 0) 
					,md1.Designationname
					,c.StartDate
					,c.EndDate
					,c.TotalPausedTime
				ORDER BY c.CallLogId DESC
			';
		
			PRINT (@SQL)
			PRINT( @SQL1)
			PRINT( @SQL2)
			EXEC (@SQL 
				+ @SQL1
				+ @SQL2
				);
	END
	ELSE IF(ISNULL(@mode,'')='ADDPROJECT')
	BEGIN
		  SET @SQL ='	
		 		   DECLARE @ErrorMsg NVARCHAR(200) = ''''
				   IF EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Projects] WHERE RTRIM(LTRIM(Projectcode)) = '''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Projectcode)), '')), '''', '''''')+''')			  				
					   SET @ErrorMsg += ''Project Code already exists. '';
			
               
				   IF EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog_Projects] WHERE RTRIM(LTRIM(Projectname)) = '''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Projectname)), '')), '''', '''''')+''' )
					   SET @ErrorMsg += ''Project Name already exists.'';
               
				   IF LEN(@ErrorMsg) > 0
				   BEGIN
					   SELECT 
							 0 AS stat
							,@ErrorMsg AS stat_msg
							,1001 as stat_code;						  
					   RETURN;
				   END
               
				   INSERT INTO  ['+@DBNAME+'].[dbo].[CallLog_Projects]
						  (
							Projectcode
						   ,Projectname
						   ,CreatedBy
						   ,CreatedDate
						  )
				   VALUES (
							'''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Projectcode)), '')), '''', '''''')+'''
						   ,'''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Projectname)), '')), '''', '''''')+'''
						   ,  '+CONVERT(NVARCHAR(255),ISNULL(RTRIM(LTRIM(@CreatedBy)),0))+'
						   , ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
						 );
                           
				   SELECT 
						1 AS stat
					   ,''Project inserted successfully.'' AS stat_msg
					   , 1000 AS stat_code;'
			 			     				
		  PRINT(@SQL)
		  EXEC(@SQL)
 
	END
	ELSE IF(ISNULL(@mode,'')='EMPLOYEE_LIST')
	BEGIN
			SET @SQL = '
				SELECT
					us.id AS userid,
					LTRIM(RTRIM(
						ISNULL(us.firstname, '''') + '' '' +
						CASE
							WHEN ISNULL(us.middlename, '''') <> ''''
								THEN us.middlename + '' ''
							ELSE ''''
						END +
						ISNULL(us.lastname, '''')
					)) AS [user],
					us.designation,
					d.id AS DesignaitonId
				FROM ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] AS us WITH (NOLOCK)
				INNER JOIN ['+@DBNAME+'].[dbo].[Mastermanagement_Designation] AS d WITH (NOLOCK)
					ON d.Designationname = us.designation
				WHERE us.id <> '+convert(nvarchar(max),isnull(@EmpId,0))+'
				  AND ISNULL(us.IsActive, 0) = 1
				  AND ISNULL(us.IsDelete, 0) = 0
				  AND ISNULL(us.designation, '''') <> '''';
			';

		  PRINT (@SQL)
		  EXEC (@SQL)
	END
	ELSE IF ISNULL(@mode, '') IN ('CALLLOGLIST', 'CALLLOGLIST_CUST1', 'CALLLOGLIST_WEB1')
	BEGIN
		IF OBJECT_ID('tempdb..#FilteredCallLog') IS NOT NULL
		DROP TABLE #FilteredCallLog;

		IF OBJECT_ID('tempdb.#ReviewDeptIssue') IS NOT NULL
		DROP TABLE #ReviewDeptIssue;

		IF OBJECT_ID('tempdb.#Comments') IS NOT NULL
		DROP TABLE #Comments;

		IF OBJECT_ID('tempdb.#FollowUp') IS NOT NULL
		DROP TABLE #FollowUp;

		SET @SQL = '
			DECLARE @CurrentDateTime DATETIME = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE()),
					@Filter NVARCHAR(255) = ''' + ISNULL(CONVERT(NVARCHAR(255), @Filter), '') + ''',
					@SearchTerm NVARCHAR(MAX) = ''' + ISNULL(CONVERT(NVARCHAR(255), @SearchTerm), '') + ''',
					@StartDate  NVARCHAR(255) = ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''',
					@EndDate  NVARCHAR(255) = ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + ''',
					@ProjectID INT = ' + CONVERT(nvarchar(255), ISNULL(@ProjectID, 0)) + ',
					@ProjectIds NVARCHAR(MAX) = ''' + CONVERT(nvarchar(MAX), ISNULL(@ProjectIds, '''')) + ''',
					@StatusIds NVARCHAR(MAX) = ''' + CONVERT(nvarchar(MAX), @StatusIds) + ''',
					@ExternalStatusID INT = ' + CONVERT(nvarchar(255), ISNULL(@ExternalStatusID, 0)) + ',
					@StatusId INT = ' + CONVERT(nvarchar(255), ISNULL(@StatusId, 0)) + ';

			IF ISNULL(''' + @mode + ''', '''') IN (''CALLLOGLIST_CUST'', ''CALLLOGLIST_WEB'')
			BEGIN
				SELECT
					@ProjectID = custid 
				FROM ['+@DBNAME+'].[dbo].[corp_cust] with (nolock)
				WHERE userid='''+@appuserid+''';
			END

			SELECT
				c.CallLogId
				, c.EntryDate
				, c.ProjectID
				, c.CustomerName
				, c.Descr
				, c.CreatedBy
				, c.CreatedDate
				, c.AppId
				, c.InternalStatusID
				, c.ExternalStatusID
				, c.Feedback
				, c.RatingByCustomer
				, c.RatingDateTime
				, c.Source
				, c.TaskId
				, c.Priorityid
				, c.StartDate
				, c.EndDate
				, c.TotalPausedTime
				, c.CallDetails
				, c.ParentId
				, c.EmpId
				, c.DeptId
				, c.CallTypeId
			INTO #FilteredCallLog
			FROM ['+@DBNAME+'].[dbo].[CallLog] c WITH (NOLOCK)
			WHERE c.IsActive = 1
			AND (
				''' + @mode + ''' NOT IN (''CALLLOGLIST_CUST'', ''CALLLOGLIST_WEB'')
				OR c.EntryDate >= DATEADD(DAY, -15, CAST(@CurrentDateTime AS DATE))
			)
			AND (
				ISNULL(@Filter, '''') = ''''
				OR (
					@Filter = ''Date''
					AND (
						ISNULL(@StartDate, '''') = ''''
						OR @StartDate = ''1900-01-01''
						OR c.EntryDate >= @StartDate
					)
					AND (
						ISNULL(@EndDate, '''') = ''''
						OR @EndDate = ''1900-01-01''
						OR c.EntryDate < DATEADD(DAY, 1, @EndDate)
					)
				)
				OR (
					@Filter = ''CallStart''
					AND (
						ISNULL(@StartDate, '''') = ''''
						OR @StartDate = ''1900-01-01''
						OR c.StartDate >= @StartDate
					)
					AND (
						ISNULL(@EndDate, '''') = ''''
						OR @EndDate = ''1900-01-01''
						OR c.StartDate < DATEADD(DAY, 1, @EndDate)
					)
				)
				OR (
					@Filter = ''CallClosed''
					AND (
						ISNULL(@StartDate, '''') = ''''
						OR @StartDate = ''1900-01-01''
						OR c.EndDate >= @StartDate
					)
					AND (
						ISNULL(@EndDate, '''') = ''''
						OR @EndDate = ''1900-01-01''
						OR c.EndDate < DATEADD(DAY, 1, @EndDate)
					)
				)
			)
			AND (
				ISNULL(@ProjectID, 0) = 0
				OR ISNULL(c.ProjectID, 0) = @ProjectID
			)
			AND (
				ISNULL(@ProjectIds, '''') = ''''
				OR ISNULL(c.ProjectID, 0) IN (
					SELECT LTRIM(RTRIM(value))
					FROM STRING_SPLIT(@ProjectIds, '','')
				)
			)
			AND (
				ISNULL(@ExternalStatusID, 0) = 0
				OR ISNULL(c.ExternalStatusID, 0) = @ExternalStatusID
			)
			AND (
				ISNULL(@StatusId, 0) = 0
				OR ISNULL(c.InternalStatusID, 0) = @StatusId
				OR ISNULL(c.ExternalStatusID, 0) = @StatusId
			)
			AND (
				ISNULL(@StatusIds, '''') = ''''
				OR ISNULL(c.InternalStatusID, 0) IN (
					SELECT TRY_CAST(LTRIM(RTRIM(value)) AS INT)
					FROM STRING_SPLIT(@StatusIds, '','')
					WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL
				)
				OR ISNULL(c.ExternalStatusID, 0) IN (
					SELECT TRY_CAST(LTRIM(RTRIM(value)) AS INT)
					FROM STRING_SPLIT(@StatusIds, '','')
					WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL
				)
			)

			CREATE NONCLUSTERED INDEX IX_FilteredCallLog
			ON #FilteredCallLog(CallLogId);
		';
		PRINT(@SQL)
		SET @SQL1 = '
			SELECT
			  cc.CallLogId
			, Comment =
				ISNULL(
					REPLACE(
						(
							SELECT
								  cc1.Id AS id
								, ISNULL(cc1.Comments, '''') AS text
								, ISNULL(cc1.FilePath, '''') AS img
								,CASE 
									WHEN ISNULL(cc1.IsClient, 0) = 1 THEN
										LTRIM(RTRIM(
											ISNULL(coc.firstname, '''') + '' '' +
											ISNULL(coc.lastname, '''')
										))
									WHEN ISNULL(cc1.CreatedBy, 0) = 0 THEN ''''
									ELSE
										LTRIM(RTRIM(
											ISNULL(e.firstname, '''') + '' '' +
											CASE 
												WHEN ISNULL(e.middlename, '''') <> '''' 
												THEN e.middlename + '' '' 
												ELSE '''' 
											END +
											ISNULL(e.lastname, '''')
										))
								 END AS Name
								, cc1.CreatedDate AS time
								,ISNULL(cc1.IsClient, 0) AS IsClient
							FROM [' + @DBNAME + '].[dbo].[CallLog_Comments] cc1 WITH (NOLOCK)
							LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] e WITH (NOLOCK)
									ON cc1.CreatedBy = e.id
									AND ISNULL(cc1.IsClient, 0) = 0
							LEFT JOIN  ['+@DBNAME+'].dbo.[corp_cust] coc WITH(NOLOCK) 
								   ON cc1.CreatedBy = coc.id
								   AND ISNULL(cc1.IsClient, 0) = 1
							WHERE cc1.CallLogId = cc.CallLogId
							ORDER BY cc1.Id
							FOR JSON PATH
						),
						''\/'',
						''/''
					),
					''''
				)
			INTO #Comments
			FROM
			(
				SELECT DISTINCT CallLogId
				FROM #FilteredCallLog
			) cc;

			CREATE NONCLUSTERED INDEX IX_Comments
				ON #Comments(CallLogId);

			SELECT
				  ff.CallLogId
				, FollowUpList =
					ISNULL(
						REPLACE(
							(
								SELECT
									  f.Id
									, f.CallStart
									, ISNULL(f.CallClosed, '''') AS CallClosed
									, CONVERT(
										VARCHAR(8),
										DATEADD(
											SECOND,
											ISNULL(f.CallDuration, 0),
											0
										),
										108
									  ) AS CallDuration
									, CASE
										WHEN ISNULL(f.CreatedBy, 0) = 0
										THEN ''''
										ELSE LTRIM(RTRIM(
											  ISNULL(up1.firstname, '''')
											+ '' ''
											+ CASE
												WHEN ISNULL(up1.middlename, '''') <> ''''
												THEN up1.middlename + '' ''
												ELSE ''''
											  END
											+ ISNULL(up1.lastname, '''')
										))
									  END AS CreatedBy
									, CASE
										WHEN ISNULL(f.ReceivedBy, 0) = 0
										THEN ''''
										ELSE LTRIM(RTRIM(
											  ISNULL(up2.firstname, '''')
											+ '' ''
											+ CASE
												WHEN ISNULL(up2.middlename, '''') <> ''''
												THEN up2.middlename + '' ''
												ELSE ''''
											  END
											+ ISNULL(up2.lastname, '''')
										))
									  END AS ReceivedBy
									, CASE
										WHEN ISNULL(f.ForwardedEmpId, 0) = 0
										THEN ''''
										ELSE LTRIM(RTRIM(
											  ISNULL(up3.firstname, '''')
											+ '' ''
											+ CASE
												WHEN ISNULL(up3.middlename, '''') <> ''''
												THEN up3.middlename + '' ''
												ELSE ''''
											  END
											+ ISNULL(up3.lastname, '''')
										))
									  END AS ForwardedEmp
									, ISNULL(ss1.Name, '''') AS InternalStatus
									, ISNULL(f.InternalStatus, 0) AS InternalStatusId
									, ISNULL(f.Description, '''') AS Description
									, f.CreatedDate
								FROM [' + @DBNAME + '].[dbo].[CallLog_Follow_Up] f WITH (NOLOCK)
								LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] up1 WITH (NOLOCK)
									ON f.CreatedBy = up1.id
								LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] up2 WITH (NOLOCK)
									ON f.ReceivedBy = up2.id
								LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] up3 WITH (NOLOCK)
									ON f.ForwardedEmpId = up3.id
								LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_status] ss1 WITH (NOLOCK)
									ON f.InternalStatus = ss1.StatusID
								WHERE f.CallLogId = ff.CallLogId
								ORDER BY f.Id DESC
								FOR JSON PATH
							),
		';
		PRINT(@SQL1)
		SET @SQL2 = '
							''\/'',
							''/''
						),
						''''
					)
			INTO #FollowUp
			FROM
			(
				SELECT DISTINCT CallLogId
				FROM #FilteredCallLog
			) ff;

			CREATE NONCLUSTERED INDEX IX_FollowUp
				ON #FollowUp(CallLogId);

			SELECT
				  rr.CallLogId
				, review_dept_issue_list =
					ISNULL(
						REPLACE(
							(
								SELECT
									  md.Id AS dept_id
									, ISNULL(md.Designationname, '''') AS dept_name
									, ci.IssueId AS issue_id
									, ISNULL(ci.Issues, '''') AS issue_name
								FROM [' + @DBNAME + '].[dbo].[CallLog_Review_Form] cr WITH (NOLOCK)
								LEFT JOIN [' + @DBNAME + '].[dbo].[Mastermanagement_Designation] md WITH (NOLOCK)
									ON md.id = cr.DeptId
								LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_Review_Issues] ci WITH (NOLOCK)
									ON ci.IssueId = cr.IssueId
								WHERE cr.CallLogId = rr.CallLogId
								FOR JSON PATH
							),
							''\/'',
							''/''
						),
						''''
					)
			INTO #ReviewDeptIssue
			FROM
			(
				SELECT DISTINCT CallLogId
				FROM #FilteredCallLog
			) rr;

			CREATE NONCLUSTERED INDEX IX_ReviewDeptIssue
				ON #ReviewDeptIssue(CallLogId);
	
			 SELECT
				  c.CallLogId AS sr
				, c.EntryDate AS date
				, u.customercode AS company
				, c.CustomerName AS callBy
				, ISNULL(a.AppName, '''') AS appname
				, ISNULL(c.Descr, '''') AS description
				, CASE
					WHEN ISNULL(c.CreatedBy, 0) = 0
					THEN ''''
					ELSE LTRIM(RTRIM(
						  ISNULL(e1.firstname, '''')
						+ '' ''
						+ CASE
							WHEN ISNULL(e1.middlename, '''') <> ''''
							THEN e1.middlename + '' ''
							ELSE ''''
						  END
						+ ISNULL(e1.lastname, '''')
					))
				  END AS receivedBy
				, CONVERT(VARCHAR(5), c.CreatedDate, 108) AS time
				, ISNULL(md1.Designationname, '''') AS DeptName
				, CASE
					WHEN ISNULL(c.EmpId, 0) = 0
					THEN ''''
					ELSE LTRIM(RTRIM(
						  ISNULL(e.firstname, '''')
						+ '' ''
						+ CASE
							WHEN ISNULL(e.middlename, '''') <> ''''
							THEN e.middlename + '' ''
							ELSE ''''
						  END
						+ ISNULL(e.lastname, '''')
					))
				  END AS AssignedEmpName
				, ISNULL(s1.Name, '''') AS status
				, ISNULL(s2.Name, '''') AS Estatus
				, ISNULL(c.Feedback, '''') AS feedback
				, ISNULL(c.RatingByCustomer, 0) AS rating
				, ISNULL(c.RatingDateTime, '''') AS RatingDateTime
				, ISNULL(c.Source, '''') AS topicRaisedBy
				, ISNULL(c.TaskId, 0) AS TaskId
				, ISNULL(p.Name, '''') AS priority
				, ISNULL(CONVERT(VARCHAR(19), c.StartDate, 120), '''') AS callStart
				, ISNULL(CONVERT(VARCHAR(19), c.EndDate, 120), '''') AS callClosed
				,ISNULL(
					CONVERT(VARCHAR(8), 
						DATEADD(SECOND, 
							DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
						), ''00:00:00''), 108),
				'''') AS CallDuration
				, ISNULL(c.CallDetails, '''') AS callDetails
				, ISNULL(t.TicketNo, '''') AS ticket
				, ISNULL(
					CONVERT(VARCHAR(19), t.CreatedDate, 120),
					''''
				  ) AS Ticket_CreatedDate
				, ISNULL(review.Satisfaction, '''') AS Satisfaction
				, ISNULL(review.review_comments, '''') AS review_comments
				, ISNULL(cct.TypeName, '''') AS CallType
				, ISNULL(c.ParentId, '''') AS parentId
				, ISNULL(rdi.review_dept_issue_list, '''') AS review_dept_issue_list
				, ISNULL(cm.Comment, '''') AS comment
				, ISNULL(fu.FollowUpList, '''') AS FollowUpList
		';
		PRINT(@SQL2)
		SET @SQL3 = '
			FROM #FilteredCallLog c
			LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] u WITH (NOLOCK)
				ON c.ProjectID = u.id
			LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_AppName] a WITH (NOLOCK)
				ON c.AppId = a.AppId
			LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_status] s1 WITH (NOLOCK)
				ON c.InternalStatusID = s1.StatusID
			LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_status] s2 WITH (NOLOCK)
				ON c.ExternalStatusID = s2.StatusID
			LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_Priority] p WITH (NOLOCK)
				ON c.Priorityid = p.Priorityid
			LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_Tickets] t WITH (NOLOCK)
				ON c.CallLogId = t.CallLogId
			LEFT JOIN [' + @DBNAME + '].[dbo].[Mastermanagement_Designation] md1 WITH (NOLOCK)
				ON md1.id = c.DeptId
			LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] e WITH (NOLOCK)
				ON c.EmpId = e.id
			LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] e1 WITH (NOLOCK)
				ON c.CreatedBy = e1.id
			LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_CallType] cct WITH (NOLOCK)
				ON cct.Id = c.CallTypeId
			OUTER APPLY
			(
				SELECT
					  MAX(ISNULL(cr.Satisfaction, '''')) AS Satisfaction
					, MAX(ISNULL(cr.Comments, '''')) AS review_comments
				FROM [' + @DBNAME + '].[dbo].[CallLog_Review_Form] cr WITH (NOLOCK)
				WHERE cr.CallLogId = c.CallLogId
			) review
			LEFT JOIN #ReviewDeptIssue rdi
				ON rdi.CallLogId = c.CallLogId
			LEFT JOIN #Comments cm
				ON cm.CallLogId = c.CallLogId
			LEFT JOIN #FollowUp fu
				ON fu.CallLogId = c.CallLogId
			WHERE
			(
				ISNULL(@SearchTerm, '''') = ''''
				OR c.CustomerName LIKE ''%'' + @SearchTerm + ''%''
				OR c.Descr LIKE ''%'' + @SearchTerm + ''%''
				OR c.CallDetails LIKE ''%'' + @SearchTerm + ''%''
				OR u.customercode LIKE ''%'' + @SearchTerm + ''%''
				OR a.AppName LIKE ''%'' + @SearchTerm + ''%''
				OR s1.Name LIKE ''%'' + @SearchTerm + ''%''
				OR s2.Name LIKE ''%'' + @SearchTerm + ''%''
				OR p.Name LIKE ''%'' + @SearchTerm + ''%''
				OR t.TicketNo LIKE ''%'' + @SearchTerm + ''%''
				OR cm.Comment LIKE ''%'' + @SearchTerm + ''%''
				OR review.review_comments LIKE ''%'' + @SearchTerm + ''%''
				OR md1.Designationname LIKE ''%'' + @SearchTerm + ''%''
				OR LTRIM(RTRIM(ISNULL(e.firstname, '''') + '' '' + 
					CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END + 
					ISNULL(e.lastname, '''')
				)) LIKE ''%' + @SearchTerm + '%'' 
				OR LTRIM(RTRIM(ISNULL(e1.firstname, '''') + '' '' + 
					CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END + 
					ISNULL(e1.lastname, '''')
				)) LIKE ''%' + @SearchTerm + '%''
			)
			ORDER BY c.CallLogId DESC
		';
		IF (ISNULL(@mode, '') = 'CALLLOGLIST_WEB')
		BEGIN
			SET @SQL3 += '
				OFFSET ((' + LTRIM(RTRIM(STR(@Page))) + ' - 1) * ' + LTRIM(RTRIM(STR(@PageSize))) + ') ROWS
				FETCH NEXT ' + LTRIM(RTRIM(STR(@PageSize))) + ' ROWS ONLY;
			';
		END

		SET @SQL3 += '
			DROP TABLE #ReviewDeptIssue;
			DROP TABLE #Comments;
			DROP TABLE #FollowUp;
			DROP TABLE #FilteredCallLog;
		'
		PRINT (@SQL3);
		EXEC(@SQL+@SQL1+@SQL2+@SQL3)
	END
	ELSE IF(ISNULL(@mode,'')='CALLLOGLIST1')
	BEGIN

			SET @SQL = '
				SELECT DISTINCT
					 c.CallLogId AS sr
					,c.EntryDate AS date
					,u.customercode AS company
					,c.CustomerName AS callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr, '''') AS description
					,CASE
						WHEN ISNULL(c.createdby, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						))
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname, '''') AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						))
					 END AS AssignedEmpName
					,ISNULL(s1.Name, '''') AS status
					,ISNULL(s2.Name, '''') AS Estatus
					,ISNULL(c.Feedback, '''') AS feedback
					,ISNULL(c.RatingByCustomer, 0) AS rating
					,ISNULL(c.RatingDateTime, '''') AS RatingDateTime
					,ISNULL(c.Source,'''') AS topicRaisedBy
					,ISNULL(c.TaskId, 0) AS TaskId
					,ISNULL(p.Name, '''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed
					,ISNULL(
						CONVERT(VARCHAR(8), 
						DATEADD(SECOND, 
							DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
							 ), ''00:00:00''), 108),
					'''') AS CallDuration
					,ISNULL(c.CallDetails, '''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate 
					,MAX(ISNULL(cr.Satisfaction, '''')) AS Satisfaction
					,MAX(ISNULL(cr.Comments, '''')) AS review_comments
					,ISNULL(cct.TypeName, '''') AS CallType
				'
			SET @SQL1 = '
					,ISNULL(REPLACE(
						  (
							SELECT 
								 md.Id AS dept_id
								,ISNULL(md.Designationname, '''') AS dept_name
								,ci.IssueId AS issue_id
								,ISNULL(ci.Issues, '''') AS issue_name
							FROM [' + @DBNAME + '].dbo.[CallLog_Review_Form] cr WITH (NOLOCK)
							LEFT JOIN [' + @DBNAME + '].dbo.[Mastermanagement_Designation] md WITH (NOLOCK) 
								   ON md.id = cr.DeptId
							LEFT JOIN [' + @DBNAME + '].dbo.[CallLog_Review_Issues] ci WITH (NOLOCK) 
								   ON cr.IssueId = ci.IssueId
							WHERE cr.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS review_dept_issue_list
					,ISNULL(REPLACE(
						  (
							SELECT 
								 cc.Id AS id
								,ISNULL(cc.Comments,'''') AS text
								,ISNULL(cc.FilePath,'''') AS img
								 ,CASE 
									WHEN ISNULL(cc.IsClient, 0) = 1 THEN
										LTRIM(RTRIM(
											ISNULL(coc.firstname, '''') + '' '' +
											ISNULL(coc.lastname, '''')
										))
									WHEN ISNULL(cc.CreatedBy, 0) = 0 THEN ''''
									ELSE
										LTRIM(RTRIM(
											ISNULL(e2.firstname, '''') + '' '' +
											CASE 
												WHEN ISNULL(e2.middlename, '''') <> '''' 
												THEN e2.middlename + '' '' 
												ELSE '''' 
											END +
											ISNULL(e2.lastname, '''')
										))
								 END AS Name
								,cc.CreatedDate AS time
								,ISNULL(cc.IsClient, 0) AS IsClient
							FROM ['+@DBNAME +'].dbo.[CallLog_Comments] cc WITH (NOLOCK)
							LEFT JOIN  ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e2 WITH(NOLOCK) 
								   ON cc.CreatedBy = e2.id
								   AND ISNULL(cc.IsClient, 0) = 0
							LEFT JOIN  ['+@DBNAME+'].dbo.[corp_cust] coc WITH(NOLOCK) 
								   ON cc.CreatedBy = coc.id
								   AND ISNULL(cc.IsClient, 0) = 1
							WHERE cc.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS comment
			';
			SET @SQL2 = ' 
				,ISNULL(c.ParentId, '''') AS parentId
				,ISNULL(REPLACE((
					SELECT 
						f.Id,
						f.CallStart,
						isnull(f.CallClosed, '''') as CallClosed,
						CONVERT(VARCHAR(8),
							DATEADD(SECOND, ISNULL(f.CallDuration,0), 0),
						108) AS CallDuration,
						CASE 
							WHEN ISNULL(f.CreatedBy, 0) = 0 THEN '''' 
							ELSE LTRIM(RTRIM(
								ISNULL(up1.firstname, '''') + '' '' +
								CASE WHEN ISNULL(up1.middlename, '''') <> '''' THEN up1.middlename + '' '' ELSE '''' END +
								ISNULL(up1.lastname, '''')
							))
						 END AS CreatedBy,
						 CASE 
							WHEN ISNULL(f.ReceivedBy, 0) = 0 THEN ''''
							ELSE LTRIM(RTRIM(
								ISNULL(up2.firstname, '''') + '' '' +
								CASE WHEN ISNULL(up2.middlename, '''') <> '''' THEN up2.middlename + '' '' ELSE '''' END +
								ISNULL(up2.lastname, '''')
							))
						 END AS ReceivedBy,
						 CASE 
							WHEN ISNULL(f.ForwardedEmpId, 0) = 0 THEN '''' 
							ELSE LTRIM(RTRIM(
								ISNULL(up3.firstname, '''') + '' '' +
								CASE WHEN ISNULL(up3.middlename, '''') <> '''' THEN up3.middlename + '' '' ELSE '''' END +
								ISNULL(up3.lastname, '''')
							))
						 END AS ForwardedEmp,
						 ISNULL(ss1.Name, '''') AS InternalStatus,
						 ISNULL(f.InternalStatus, 0) AS InternalStatusId,
						 ISNULL(f.Description, '''') AS Description,
						 f.CreatedDate
					FROM ['+@DBNAME+'].dbo.CallLog_Follow_Up f WITH(NOLOCK)
					LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up1 WITH(NOLOCK)
					  ON f.CreatedBy = up1.id
					LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up2 WITH(NOLOCK)
					  ON f.ReceivedBy = up2.id
					LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up3 WITH(NOLOCK)
					  ON f.ForwardedEmpId= up3.id
					LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] ss1 WITH(NOLOCK)
					  ON f.InternalStatus = ss1.StatusID
					WHERE f.CallLogId = c.CallLogId
					ORDER BY f.Id DESC
					FOR JSON PATH
				), ''\/'',''/''),'''') AS FollowUpList
				FROM [' + @DBNAME + '].dbo.[CallLog] c WITH(NOLOCK)
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
					  ON c.ProjectID = u.id
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
					  ON c.AppId = A.AppId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
					  ON c.InternalStatusID = s1.StatusID
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
					  ON c.ExternalStatusID = s2.StatusID
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
					  ON c.Priorityid = p.Priorityid
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
					  ON c.CallLogId = t.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Review_Form] cr WITH(NOLOCK)
					  ON cr.CallLogId = c.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
					  ON md1.id = c.DeptId
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
					  ON c.EmpId = e.id
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
					  ON c.createdby = e1.id
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Comments] cc WITH(NOLOCK)
					  ON cc.CallLogId = c.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_CallType] cct WITH(NOLOCK)
					  ON cct.Id = c.CallTypeId
				WHERE c.IsActive = 1 
			';

			IF CAST(@StartDate AS DATE)='1900-01-01'  SET @StartDate = '2000-01-01';
			IF CAST(@EndDate AS DATE)='1900-01-01' SET @EndDate = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE());

			-- Add filters to the query based on the parameters
			IF @Filter = 'Date'
				SET @SQL3 = ' AND CAST(c.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'CallStart'
				SET @SQL3 = ' AND CAST(c.StartDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'CallClosed'
				SET @SQL3 = ' AND CAST(c.EndDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF ISNULL(@Filter,'') = ''
				SET @SQL3 = ' AND CAST(c.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';

			IF @ProjectID IS NOT NULL AND @ProjectID <> ''
				SET @SQL4 = ' AND c.ProjectID = ' + CONVERT(NVARCHAR(10), @ProjectID, 0);
			
			IF @StatusId IS NOT NULL AND @StatusId <> ''
				SET @SQL5 = ' AND (c.InternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) +' OR c.ExternalStatusID =  '+ CONVERT(NVARCHAR(10), @StatusId, 0)+')';

			IF @ExternalStatusID IS NOT NULL AND ISNULL(@ExternalStatusID, 0) <> 0
				SET @SQL5 = ' AND c.ExternalStatusID = '+ CONVERT(NVARCHAR(10), @ExternalStatusID, 0)+'';

			-- Add search term filter
			IF @SearchTerm IS NOT NULL AND @SearchTerm <> ''
			BEGIN
				SET @SearchTerm = REPLACE(@SearchTerm, '''', '''''') -- Escape single quotes
				SET @SQL6 = ' AND (
									c.CustomerName LIKE ''%' + @SearchTerm + '%'' OR 
									c.Descr LIKE ''%' + @SearchTerm + '%'' OR 
									c.CallDetails LIKE ''%' + @SearchTerm + '%'' OR 
									u.customercode LIKE ''%' + @SearchTerm + '%'' OR
									A.AppName LIKE ''%' + @SearchTerm + '%'' OR
									s1.Name LIKE ''%' + @SearchTerm + '%'' OR 
									s2.Name LIKE ''%' + @SearchTerm + '%'' OR 
									p.Name LIKE ''%' + @SearchTerm + '%'' OR
									t.TicketNo LIKE ''%' + @SearchTerm + '%'' OR 
									cr.Comments LIKE ''%' + @SearchTerm + '%'' OR 
									cc.Comments LIKE ''%' + @SearchTerm + '%'' OR 
									md1.Designationname LIKE ''%' + @SearchTerm + '%'' OR       
									LTRIM(RTRIM(ISNULL(e.firstname, '''') + '' '' + 
										CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END + 
										ISNULL(e.lastname, '''')
									)) LIKE ''%' + @SearchTerm + '%'' OR
									LTRIM(RTRIM(ISNULL(e1.firstname, '''') + '' '' + 
										CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END + 
										ISNULL(e1.lastname, '''')
									)) LIKE ''%' + @SearchTerm + '%''
								   )';
			END
		
			SET @SQL7 = ' 
			 GROUP BY 
					 c.CallLogId
					,c.EntryDate
					,u.customercode
					,c.CustomerName
					,ISNULL(A.appname, '''')
					,ISNULL(c.Descr, '''')
					,FORMAT(c.CreatedDate, ''HH:mm'')
					,ISNULL(e.firstname, '''')
					,ISNULL(e.middlename, '''')
					,e.middlename
					,ISNULL(e.lastname, '''')
					,ISNULL(s1.Name, '''')
					,ISNULL(s2.Name, '''')
					,ISNULL(c.Feedback, '''')
					,ISNULL(c.RatingByCustomer, 0)
					,ISNULL(c.RatingDateTime, '''')
					,ISNULL(c.TaskId, 0)
					,ISNULL(e1.firstname, '''')
					,ISNULL(e1.middlename, '''')
					,e1.middlename
					,ISNULL(e1.lastname, '''')
					,ISNULL(c.Source, '''')
					,ISNULL(p.Name, '''')
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''')
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''')
					,ISNULL(c.CallDetails, '''')
					,ISNULL(t.TicketNo, '''')
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''')
					,c.createdby
					,c.ParentId
					,c.EmpId
					,md1.Designationname
					,c.StartDate
					,c.EndDate
					,c.TotalPausedTime
					,ISNULL(cct.TypeName, '''')

				ORDER BY c.CallLogId DESC
			';
		
			PRINT (@SQL)
			PRINT (@SQL1)
			PRINT (@SQL2)
			PRINT (@SQL3)
			PRINT (@SQL4)
			PRINT (@SQL5)
			PRINT (@SQL6)
			PRINT (@SQL7)

			EXEC (@SQL 
				+ @SQL1 
				+ @SQL2
				+ @SQL3
				+ @SQL4 
				+ @SQL5
				+ @SQL6
				+ @SQL7
			);
	END
	ELSE IF(ISNULL(@mode,'')='ARCHIVEDCALLLOGLIST')
	BEGIN
			SET @SQLA = '
				WITH FollowUpCTE AS (
					SELECT
						fe.CallLogId
						,ISNULL(REPLACE((
							SELECT 
								f.Id,
								f.CallStart,
								isnull(f.CallClosed, '''') as CallClosed,
								CONVERT(VARCHAR(8),
									DATEADD(SECOND, ISNULL(f.CallDuration,0), 0),
								108) AS CallDuration,
								CASE 
									WHEN ISNULL(f.CreatedBy, 0) = 0 THEN '''' 
									ELSE LTRIM(RTRIM(
										ISNULL(up1.firstname, '''') + '' '' +
										CASE WHEN ISNULL(up1.middlename, '''') <> '''' THEN up1.middlename + '' '' ELSE '''' END +
										ISNULL(up1.lastname, '''')
									))
								 END AS CreatedBy,
								 CASE 
									WHEN ISNULL(f.ReceivedBy, 0) = 0 THEN '''' 
									ELSE LTRIM(RTRIM(
										ISNULL(up2.firstname, '''') + '' '' +
										CASE WHEN ISNULL(up2.middlename, '''') <> '''' THEN up2.middlename + '' '' ELSE '''' END +
										ISNULL(up2.lastname, '''')
									))
								 END AS ReceivedBy,
								 CASE 
									WHEN ISNULL(f.ForwardedEmpId, 0) = 0 THEN '''' 
									ELSE LTRIM(RTRIM(
										ISNULL(up3.firstname, '''') + '' '' +
										CASE WHEN ISNULL(up3.middlename, '''') <> '''' THEN up3.middlename + '' '' ELSE '''' END +
										ISNULL(up3.lastname, '''')
									))
								 END AS ForwardedEmp,
								 ISNULL(ss1.Name, '''') AS InternalStatus,
								 ISNULL(f.InternalStatus, 0) AS InternalStatusId,
								 ISNULL(f.Description, '''') AS Description,
								isnull(f.ForwardedEmpId, 0) AS ForwardedEmpId,
								0 AS IsForwardFollowup,
								0 AS ResonId,
								'''' AS Reason
							FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_Follow_Up] f WITH(NOLOCK)
							LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up1 WITH(NOLOCK)
							  ON f.CreatedBy = up1.id
							LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up2 WITH(NOLOCK)
							  ON f.ReceivedBy = up2.id
							LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up3 WITH(NOLOCK)
							  ON f.ForwardedEmpId= up3.id
							LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] ss1 WITH(NOLOCK)
							  ON f.InternalStatus = ss1.StatusID
							WHERE f.CallLogId = fe.CallLogId
							ORDER BY f.Id DESC
							FOR JSON PATH
						), ''\/'',''/''),'''') AS FollowUpList
					FROM ['+@DBNAME+'].[dbo].Archived_CallLog_Follow_Up fe
					GROUP BY fe.CallLogId
				)
			';

			SET @SQL = '

				SELECT DISTINCT
					 c.CallLogId AS sr
					,c.EntryDate AS date
					,u.customercode AS company
					,c.CustomerName AS callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr, '''') AS description
					,CASE 
						WHEN ISNULL(c.createdby, 0) = 0 THEN '''' 
						ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname, '''') AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name, '''') AS status
					,ISNULL(s2.Name, '''') AS Estatus
					,ISNULL(c.Feedback, '''') AS feedback
					,ISNULL(c.RatingByCustomer, 0) AS rating
					,ISNULL(c.RatingDateTime, '''') AS RatingDateTime
					,ISNULL(c.Source,'''') AS topicRaisedBy
					,ISNULL(c.TaskId, 0) AS TaskId
					,ISNULL(p.Name, '''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed
					,ISNULL(
						CONVERT(VARCHAR(8), 
						DATEADD(SECOND, 
							DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
							 ), ''00:00:00''), 108),
					'''') AS CallDuration
					,ISNULL(c.CallDetails, '''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate 
					,MAX(ISNULL(cr.Satisfaction, '''')) AS Satisfaction
					,MAX(ISNULL(cr.Comments, '''')) AS review_comments
					,ISNULL(cct.TypeName, '''') AS CallType
				'
			SET @SQL1 = '
					,ISNULL(REPLACE(
						  (
							SELECT 
								 md.Id AS dept_id
								,ISNULL(md.Designationname, '''') AS dept_name
								,ci.IssueId AS issue_id
								,ISNULL(ci.Issues, '''') AS issue_name
							FROM [' + @DBNAME + '].dbo.[CallLog_Review_Form] cr WITH (NOLOCK)
							LEFT JOIN [' + @DBNAME + '].dbo.[Mastermanagement_Designation] md WITH (NOLOCK) 
								   ON md.id = cr.DeptId
							LEFT JOIN [' + @DBNAME + '].dbo.[CallLog_Review_Issues] ci WITH (NOLOCK) 
								   ON cr.IssueId = ci.IssueId
							WHERE cr.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS review_dept_issue_list
					,ISNULL(REPLACE(
						  (
							SELECT 
								 cc.Id AS id
								,ISNULL(cc.Comments,'''') AS text
								,ISNULL(cc.FilePath,'''') AS img
								,CASE 
									WHEN ISNULL(cc.IsClient, 0) = 1 THEN
										LTRIM(RTRIM(
											ISNULL(coc.firstname, '''') + '' '' +
											ISNULL(coc.lastname, '''')
										))
									WHEN ISNULL(cc.CreatedBy, 0) = 0 THEN ''''
									ELSE
										LTRIM(RTRIM(
											ISNULL(e2.firstname, '''') + '' '' +
											CASE 
												WHEN ISNULL(e2.middlename, '''') <> '''' 
												THEN e2.middlename + '' '' 
												ELSE '''' 
											END +
											ISNULL(e2.lastname, '''')
										))
								 END AS Name
								,cc.CreatedDate AS time
								,cc.IsClient
							FROM ['+@DBNAME +'].dbo.[Archived_CallLog_Comments] cc WITH (NOLOCK)
							LEFT JOIN  ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e2 WITH(NOLOCK) 
								   ON cc.CreatedBy = e2.id
								    AND ISNULL(cc.IsClient, 0) = 0
							LEFT JOIN  ['+@DBNAME+'].dbo.[corp_cust] coc WITH(NOLOCK) 
								   ON cc.CreatedBy = coc.id
								   AND ISNULL(cc.IsClient, 0) = 1
							WHERE cc.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS comment		        
			';
			SET @SQL2 = ' 
				,ISNULL(c.ParentId, '''') AS parentId
				,f.FollowUpList
				FROM [' + @DBNAME + '].dbo.[Archived_CallLog] c WITH(NOLOCK)
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
					  ON c.ProjectID = u.id
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
					  ON c.AppId = A.AppId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
					  ON c.InternalStatusID = s1.StatusID
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
					  ON c.ExternalStatusID = s2.StatusID
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
					  ON c.Priorityid = p.Priorityid
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
					  ON c.CallLogId = t.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Review_Form] cr WITH(NOLOCK)
					  ON cr.CallLogId = c.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
					  ON md1.id = c.DeptId
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
					  ON c.EmpId = e.id
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
					  ON c.createdby = e1.id
				LEFT JOIN ['+@DBNAME+'].dbo.[Archived_CallLog_Comments] cc WITH(NOLOCK)
					  ON cc.CallLogId = c.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_CallType] cct WITH(NOLOCK)
					  ON cct.Id = c.CallTypeId
				LEFT JOIN FollowUpCTE f ON c.CallLogId = f.CallLogId
				WHERE c.IsActive = 1 
			';

			IF CAST(@StartDate AS DATE)='1900-01-01'  SET @StartDate = '2000-01-01';
			IF CAST(@EndDate AS DATE)='1900-01-01' SET @EndDate = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE());

			IF @Filter = 'Date'
				SET @SQL3 = ' AND CAST(c.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'CallStart'
				SET @SQL3 = ' AND CAST(c.StartDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'CallClosed'
				SET @SQL3 = ' AND CAST(c.EndDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'FollowUpDate'
				SET @SQL3 = ' AND EXISTS (
					SELECT 1 FROM ['+@DBNAME+'].dbo.Archived_CallLog_Follow_Up fu
					WHERE fu.CallLogId = c.CallLogId
					AND CAST(fu.CreatedDate AS DATE) BETWEEN '''+CONVERT(NVARCHAR(10),@StartDate,120)+''' AND '''+CONVERT(NVARCHAR(10),@EndDate,120)+'''
				)';
			ELSE IF @Filter = 'FollowUpStart'
				SET @SQL3 = ' AND EXISTS (
					SELECT 1 FROM ['+@DBNAME+'].dbo.Archived_CallLog_Follow_Up fu
					WHERE fu.CallLogId = c.CallLogId
					AND CAST(fu.CallStart AS DATE) BETWEEN '''+CONVERT(NVARCHAR(10),@StartDate,120)+''' AND '''+CONVERT(NVARCHAR(10),@EndDate,120)+'''
				)';
			ELSE IF @Filter = 'FollowUpClosed'
				SET @SQL3 = ' AND EXISTS (
					SELECT 1 FROM ['+@DBNAME+'].dbo.Archived_CallLog_Follow_Up fu
					WHERE fu.CallLogId = c.CallLogId
					AND CAST(fu.CallClosed AS DATE) BETWEEN '''+CONVERT(NVARCHAR(10),@StartDate,120)+''' AND '''+CONVERT(NVARCHAR(10),@EndDate,120)+'''
				)';
			ELSE IF ISNULL(@Filter,'') = ''
				SET @SQL3 = ' AND CAST(c.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';

			IF @ProjectID IS NOT NULL AND @ProjectID <> ''
				SET @SQL4 = ' AND c.ProjectID = ' + CONVERT(NVARCHAR(10), @ProjectID, 0);
			
			IF @StatusId IS NOT NULL AND @StatusId <> ''
				SET @SQL5 = ' AND (c.InternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) +' OR c.ExternalStatusID =  '+ CONVERT(NVARCHAR(10), @StatusId, 0)+')';

			IF @ExternalStatusID IS NOT NULL AND ISNULL(@ExternalStatusID, 0) <> 0
				SET @SQL5 = ' AND c.ExternalStatusID = '+ CONVERT(NVARCHAR(10), @ExternalStatusID, 0)+'';


			IF @SearchTerm IS NOT NULL AND @SearchTerm <> ''
			BEGIN
				SET @SearchTerm = REPLACE(@SearchTerm, '''', '''''')
				SET @SQL6 = ' AND (
									c.CustomerName LIKE ''%' + @SearchTerm + '%'' OR 
									c.Descr LIKE ''%' + @SearchTerm + '%'' OR 
									c.CallDetails LIKE ''%' + @SearchTerm + '%'' OR 
									u.customercode LIKE ''%' + @SearchTerm + '%'' OR
									A.AppName LIKE ''%' + @SearchTerm + '%'' OR
									s1.Name LIKE ''%' + @SearchTerm + '%'' OR 
									s2.Name LIKE ''%' + @SearchTerm + '%'' OR 
									p.Name LIKE ''%' + @SearchTerm + '%'' OR
									t.TicketNo LIKE ''%' + @SearchTerm + '%'' OR 
									cr.Comments LIKE ''%' + @SearchTerm + '%'' OR 
									cc.Comments LIKE ''%' + @SearchTerm + '%'' OR 
									md1.Designationname LIKE ''%' + @SearchTerm + '%'' OR       
									LTRIM(RTRIM(ISNULL(e.firstname, '''') + '' '' + 
										CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END + 
										ISNULL(e.lastname, '''')
									)) LIKE ''%' + @SearchTerm + '%'' OR
									LTRIM(RTRIM(ISNULL(e1.firstname, '''') + '' '' + 
										CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END + 
										ISNULL(e1.lastname, '''')
									)) LIKE ''%' + @SearchTerm + '%''
								   )';
			END
		
			SET @SQL7 = ' 
			 GROUP BY 
					 c.CallLogId
					,c.EntryDate
					,u.customercode
					,c.CustomerName
					,ISNULL(A.appname, '''')
					,ISNULL(c.Descr, '''')
					,FORMAT(c.CreatedDate, ''HH:mm'')
					,ISNULL(e.firstname, '''')
					,ISNULL(e.middlename, '''')
					,e.middlename
					,ISNULL(e.lastname, '''')
					,ISNULL(s1.Name, '''')
					,ISNULL(s2.Name, '''')
					,ISNULL(c.Feedback, '''')
					,ISNULL(c.RatingByCustomer, 0)
					,ISNULL(c.RatingDateTime, '''')
					,ISNULL(c.TaskId, 0)
					,ISNULL(e1.firstname, '''')
					,ISNULL(e1.middlename, '''')
					,e1.middlename
					,ISNULL(e1.lastname, '''')
					,ISNULL(c.Source, '''')
					,ISNULL(p.Name, '''')
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''')
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''')
					,ISNULL(c.CallDetails, '''')
					,ISNULL(t.TicketNo, '''')
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''')
					,c.createdby
					,c.ParentId
					,c.EmpId
					,md1.Designationname
					,c.StartDate
					,c.EndDate
					,c.TotalPausedTime
					,ISNULL(cct.TypeName, '''')
					,f.FollowUpList
				ORDER BY c.CallLogId DESC
			';
			PRINT (@SQLA)
			PRINT (@SQL)
			PRINT (@SQL1)
			PRINT (@SQL2)
			PRINT (@SQL3)
			PRINT (@SQL4)
			PRINT (@SQL5)
			PRINT (@SQL6)
			PRINT (@SQL7)

			EXEC (@SQLA
				+ @SQL 
				+ @SQL1 
				+ @SQL2
				+ @SQL3
				+ @SQL4 
				+ @SQL5
				+ @SQL6
				+ @SQL7
			);
		
		
	END
	ELSE IF(ISNULL(@mode,'')='CALLLOGLIST_CUST')
	BEGIN
			SET @SQLA = '
				declare @custid as int=isnull((
					select custid from ['+@DBNAME+'].dbo.corp_cust with (nolock) 
					where userid='''+@appuserid+'''
				),0);

				WITH FollowUpCTE AS (
					SELECT
						fe.CallLogId
						,ISNULL(REPLACE((
							SELECT 
								f.Id,
								f.CallStart,
								isnull(f.CallClosed, '''') as CallClosed,
								CONVERT(VARCHAR(8),
									DATEADD(SECOND, ISNULL(f.CallDuration,0), 0),
								108) AS CallDuration,
								CASE 
									WHEN ISNULL(f.CreatedBy, 0) = 0 THEN '''' 
									ELSE LTRIM(RTRIM(
										ISNULL(up1.firstname, '''') + '' '' +
										CASE WHEN ISNULL(up1.middlename, '''') <> '''' THEN up1.middlename + '' '' ELSE '''' END +
										ISNULL(up1.lastname, '''')
									))
								 END AS CreatedBy,
								 CASE 
									WHEN ISNULL(f.ReceivedBy, 0) = 0 THEN '''' 
									ELSE LTRIM(RTRIM(
										ISNULL(up2.firstname, '''') + '' '' +
										CASE WHEN ISNULL(up2.middlename, '''') <> '''' THEN up2.middlename + '' '' ELSE '''' END +
										ISNULL(up2.lastname, '''')
									))
								 END AS ReceivedBy,
								 CASE 
									WHEN ISNULL(f.ForwardedEmpId, 0) = 0 THEN '''' 
									ELSE LTRIM(RTRIM(
										ISNULL(up3.firstname, '''') + '' '' +
										CASE WHEN ISNULL(up3.middlename, '''') <> '''' THEN up3.middlename + '' '' ELSE '''' END +
										ISNULL(up3.lastname, '''')
									))
								 END AS ForwardedEmp,
								 ISNULL(ss1.Name, '''') AS InternalStatus,
								 ISNULL(f.InternalStatus, 0) AS InternalStatusId,
								 ISNULL(f.Description, '''') AS Description,
								isnull(f.ForwardedEmpId, 0) AS ForwardedEmpId,
								isnull(f.IsForwardFollowup, 0) AS IsForwardFollowup,
								isnull(f.ResonId, 0) AS ResonId,
								cr.Reason AS Reason
							FROM ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] f WITH(NOLOCK)
							LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up1 WITH(NOLOCK)
							  ON f.CreatedBy = up1.id
							LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up2 WITH(NOLOCK)
							  ON f.ReceivedBy = up2.id
							LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up3 WITH(NOLOCK)
							  ON f.ForwardedEmpId= up3.id
							LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] ss1 WITH(NOLOCK)
							  ON f.InternalStatus = ss1.StatusID
							LEFT JOIN ['+@DBNAME+'].[dbo].[CallLog_Reason] cr WITH(NOLOCK)
								ON cr.Id = f.ResonId
							WHERE f.CallLogId = fe.CallLogId
							ORDER BY f.Id DESC
							FOR JSON PATH
						), ''\/'',''/''),'''') AS FollowUpList
					FROM ['+@DBNAME+'].[dbo].CallLog_Follow_Up fe
					GROUP BY fe.CallLogId
				)
			';
			PRINT(@SQLA)
			SET @SQL = '
				SELECT DISTINCT
					 c.CallLogId AS sr
					,c.EntryDate AS date
					,u.customercode AS company
					,c.CustomerName AS callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr, '''') AS description
					,CASE 
						WHEN ISNULL(c.createdby, 0) = 0 THEN '''' 
						ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname, '''') AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name, '''') AS status
					,ISNULL(s2.Name, '''') AS Estatus
					,ISNULL(c.Feedback, '''') AS feedback
					,ISNULL(c.RatingByCustomer, 0) AS rating
					,ISNULL(c.RatingDateTime, '''') AS RatingDateTime
					,ISNULL(c.Source,'''') AS topicRaisedBy
					,ISNULL(c.TaskId, 0) AS TaskId
					,ISNULL(p.Name, '''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
							), ''00:00:00''), 108),
					'''') AS CallDuration
					,ISNULL(c.CallDetails, '''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate 
					,MAX(ISNULL(cr.Satisfaction, '''')) AS Satisfaction
					,MAX(ISNULL(cr.Comments, '''')) AS review_comments
					,ISNULL(cct.TypeName, '''') AS CallType
				'
			SET @SQL1 = '
					,ISNULL(REPLACE(
						  (
							SELECT 
								 md.Id AS dept_id
								,ISNULL(md.Designationname, '''') AS dept_name
								,ci.IssueId AS issue_id
								,ISNULL(ci.Issues, '''') AS issue_name
							FROM ['+@DBNAME+'].dbo.[CallLog_Review_Form] cr WITH (NOLOCK)
							LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md WITH (NOLOCK) 
								   ON md.id = cr.DeptId
							LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Review_Issues] ci WITH (NOLOCK) 
								   ON cr.IssueId = ci.IssueId
							WHERE cr.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS review_dept_issue_list
					,ISNULL(REPLACE(
						  (
							SELECT 
								 cc.Id AS id
								,ISNULL(cc.Comments,'''') AS text
								,ISNULL(cc.FilePath,'''') AS img
								,CASE 
									WHEN ISNULL(cc.IsClient, 0) = 1 THEN
										LTRIM(RTRIM(
											ISNULL(coc.firstname, '''') + '' '' +
											ISNULL(coc.lastname, '''')
										))
									WHEN ISNULL(cc.CreatedBy, 0) = 0 THEN ''''
									ELSE
										LTRIM(RTRIM(
											ISNULL(e2.firstname, '''') + '' '' +
											CASE 
												WHEN ISNULL(e2.middlename, '''') <> '''' 
												THEN e2.middlename + '' '' 
												ELSE '''' 
											END +
											ISNULL(e2.lastname, '''')
										))
								 END AS Name
								,cc.CreatedDate AS time
								,ISNULL(cc.IsClient, 0) AS IsClient
							FROM ['+@DBNAME+'].dbo.[CallLog_Comments] cc WITH (NOLOCK)
							LEFT JOIN  ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e2 WITH(NOLOCK) 
								   ON cc.CreatedBy = e2.id
								   AND ISNULL(cc.IsClient, 0) = 0
							LEFT JOIN  ['+@DBNAME+'].dbo.[corp_cust] coc WITH(NOLOCK) 
								   ON cc.CreatedBy = coc.id
								   AND ISNULL(cc.IsClient, 0) = 1
							WHERE cc.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS comment		        
			';
			SET @SQL2 = ' 
				,ISNULL(c.ParentId, '''') AS parentId
				,f.FollowUpList
				FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)		    
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
					  ON c.ProjectID = u.id
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
					  ON c.AppId = A.AppId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
					  ON c.InternalStatusID = s1.StatusID
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
					  ON c.ExternalStatusID = s2.StatusID
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
					  ON c.Priorityid = p.Priorityid
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
					  ON c.CallLogId = t.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Review_Form] cr WITH(NOLOCK)
					  ON cr.CallLogId = c.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
					  ON md1.id = c.DeptId
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
					  ON c.EmpId = e.id
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
					  ON c.createdby = e1.id
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Comments] cc WITH(NOLOCK)
					  ON cc.CallLogId = c.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_CallType] cct WITH(NOLOCK)
					  ON cct.Id = c.CallTypeId
				LEFT JOIN FollowUpCTE f ON c.CallLogId = f.CallLogId
				WHERE ISNULL(c.ProjectID,0)=@custid
				and c.IsActive = 1 
			'

			IF CAST(@StartDate AS DATE)='1900-01-01'  SET @StartDate = '2000-01-01';
			IF CAST(@EndDate AS DATE)='1900-01-01' SET @EndDate = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE());

			-- Add filters to the query based on the parameters
			IF @Filter = 'Date'
				SET @SQL3 = ' AND CAST(c.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'CallStart'
				SET @SQL3 = ' AND CAST(c.StartDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'CallClosed'
				SET @SQL3 = ' AND CAST(c.EndDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			
			ELSE IF @Filter = 'FollowUpDate'
				SET @SQL3 = ' AND EXISTS (
					SELECT 1 FROM ['+@DBNAME+'].dbo.CallLog_Follow_Up fu
					WHERE fu.CallLogId = c.CallLogId
					AND CAST(fu.CreatedDate AS DATE) BETWEEN '''+CONVERT(NVARCHAR(10),@StartDate,120)+''' AND '''+CONVERT(NVARCHAR(10),@EndDate,120)+'''
				)';
			ELSE IF @Filter = 'FollowUpStart'
				SET @SQL3 = ' AND EXISTS (
					SELECT 1 FROM ['+@DBNAME+'].dbo.CallLog_Follow_Up fu
					WHERE fu.CallLogId = c.CallLogId
					AND CAST(fu.CallStart AS DATE) BETWEEN '''+CONVERT(NVARCHAR(10),@StartDate,120)+''' AND '''+CONVERT(NVARCHAR(10),@EndDate,120)+'''
				)';
			ELSE IF @Filter = 'FollowUpClosed'
				SET @SQL3 = ' AND EXISTS (
					SELECT 1 FROM ['+@DBNAME+'].dbo.CallLog_Follow_Up fu
					WHERE fu.CallLogId = c.CallLogId
					AND CAST(fu.CallClosed AS DATE) BETWEEN '''+CONVERT(NVARCHAR(10),@StartDate,120)+''' AND '''+CONVERT(NVARCHAR(10),@EndDate,120)+'''
				)';

			ELSE IF ISNULL(@Filter,'') = ''
				SET @SQL3 = ' AND CAST(c.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
		
			SET @SQL3 = ISNULL(@SQL3, '') + ' AND CAST(c.EntryDate AS DATE) >= DATEADD(DAY, -15, CAST(ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE()) AS DATE))';

			IF @StatusId IS NOT NULL AND @StatusId <> ''
				--SET @SQL4 = ' AND (c.InternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) +' OR c.ExternalStatusID =  '+ CONVERT(NVARCHAR(10), @StatusId, 0)+')';
				BEGIN
			IF @StatusId IN (44, 45)
			SET @SQL4 = ' AND (
            c.InternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) +
            ' OR c.ExternalStatusID IN (44, 45))';
			ELSE
			SET @SQL4 = ' AND (
            c.InternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) +
            ' OR c.ExternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) + ')';
			END
			
			IF @ExternalStatusID IS NOT NULL AND ISNULL(@ExternalStatusID, 0) <> 0
				SET @SQL5 = ' AND c.ExternalStatusID = '+ CONVERT(NVARCHAR(10), @ExternalStatusID, 0)+'';

			-- Add search term filter
			IF @SearchTerm IS NOT NULL AND @SearchTerm <> ''
			BEGIN
				SET @SearchTerm = REPLACE(@SearchTerm, '''', '''''') -- Escape single quotes
				SET @SQL5 = ' AND (
									c.CustomerName LIKE ''%' + @SearchTerm + '%'' OR 
									c.Descr LIKE ''%' + @SearchTerm + '%'' OR 
									c.CallDetails LIKE ''%' + @SearchTerm + '%'' OR 
									u.customercode LIKE ''%' + @SearchTerm + '%'' OR
									A.AppName LIKE ''%' + @SearchTerm + '%'' OR
									s1.Name LIKE ''%' + @SearchTerm + '%'' OR 
									s2.Name LIKE ''%' + @SearchTerm + '%'' OR 
									p.Name LIKE ''%' + @SearchTerm + '%'' OR
									t.TicketNo LIKE ''%' + @SearchTerm + '%'' OR 
									cr.Comments LIKE ''%' + @SearchTerm + '%'' OR 
									cc.Comments LIKE ''%' + @SearchTerm + '%'' OR 
									md1.Designationname LIKE ''%' + @SearchTerm + '%'' OR       
									LTRIM(RTRIM(ISNULL(e.firstname, '''') + '' '' + 
										CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END + 
										ISNULL(e.lastname, '''')
									)) LIKE ''%' + @SearchTerm + '%'' OR
									LTRIM(RTRIM(ISNULL(e1.firstname, '''') + '' '' + 
										CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END + 
										ISNULL(e1.lastname, '''')
									)) LIKE ''%' + @SearchTerm + '%''
								   )';
			END

			SET @SQL6 = '
			 GROUP BY 
					 c.CallLogId
					,c.EntryDate
					,u.customercode
					,c.CustomerName
					,ISNULL(A.appname, '''')
					,ISNULL(c.Descr, '''')
					,FORMAT(c.CreatedDate, ''HH:mm'')
					,ISNULL(e.firstname, '''')
					,ISNULL(e.middlename, '''')
					,e.middlename
					,ISNULL(e.lastname, '''')
					,ISNULL(s1.Name, '''')
					,ISNULL(s2.Name, '''')
					,ISNULL(c.Feedback, '''')
					,ISNULL(c.RatingByCustomer, 0)
					,ISNULL(c.RatingDateTime, '''')
					,ISNULL(c.TaskId, 0)
					,ISNULL(e1.firstname, '''')
					,ISNULL(e1.middlename, '''')
					,e1.middlename
					,ISNULL(e1.lastname, '''')
					,ISNULL(c.Source, '''')
					,ISNULL(p.Name, '''')
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''')
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''')
					,ISNULL(c.CallDetails, '''')
					,ISNULL(t.TicketNo, '''')
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''')
					,c.createdby
					,c.ParentId
					,c.EmpId
					,md1.Designationname
					,c.StartDate
					,c.EndDate
					,c.TotalPausedTime
					,ISNULL(cct.TypeName, '''')
					,f.FollowUpList
				ORDER BY c.CallLogId DESC
			';
		
			PRINT (@SQL)
			PRINT (@SQL1)
			PRINT (@SQL2)
			PRINT (@SQL3)
			PRINT (@SQL4)
			PRINT (@SQL5)
			PRINT (@SQL6)

			EXEC (@SQLA + @SQL + @SQL1 + @SQL2 + @SQL3 + @SQL4 + @SQL5 + @SQL6);
		
	END
	ELSE IF(ISNULL(@mode,'')='CALLLOGLIST_WEB')
	BEGIN
			SET @SQL = '
				declare @custid as int=isnull((
					select custid from ['+@DBNAME+'].dbo.corp_cust with (nolock) 
					where userid='''+@appuserid+'''
				),0)

				SELECT DISTINCT
					c.CallLogId AS sr
					,c.EntryDate AS date
					,u.customercode AS company
					,c.CustomerName AS callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr, '''') AS description
					,CASE 
						WHEN ISNULL(c.createdby, 0) = 0 THEN '''' 
						ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname, '''') AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name, '''') AS status
					,ISNULL(s2.Name, '''') AS Estatus
					,ISNULL(c.Feedback, '''') AS feedback
					,ISNULL(c.RatingByCustomer, 0) AS rating
					,ISNULL(c.RatingDateTime, '''') AS RatingDateTime
					,ISNULL(c.Source,'''') AS topicRaisedBy
					,ISNULL(c.TaskId, 0) AS TaskId
					,ISNULL(p.Name, '''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
							), ''00:00:00''), 108),
					'''') AS CallDuration
					,ISNULL(c.CallDetails, '''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate 
					,MAX(ISNULL(cr.Satisfaction, '''')) AS Satisfaction
					,MAX(ISNULL(cr.Comments, '''')) AS review_comments
					,ISNULL(cct.TypeName, '''') AS CallType
				'
			SET @SQL1 = '
					,ISNULL(REPLACE(
						  (
							SELECT 
								 md.Id AS dept_id
								,ISNULL(md.Designationname, '''') AS dept_name
								,ci.IssueId AS issue_id
								,ISNULL(ci.Issues, '''') AS issue_name
							FROM ['+@DBNAME+'].dbo.[CallLog_Review_Form] cr WITH (NOLOCK)
							LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md WITH (NOLOCK) 
								   ON md.id = cr.DeptId
							LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Review_Issues] ci WITH (NOLOCK) 
								   ON cr.IssueId = ci.IssueId
							WHERE cr.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS review_dept_issue_list
					,ISNULL(REPLACE(
						  (
							SELECT 
								 cc.Id AS id
								,ISNULL(cc.Comments,'''') AS text
								,ISNULL(cc.FilePath,'''') AS img
								,CASE 
									WHEN ISNULL(cc.IsClient, 0) = 1 THEN
										LTRIM(RTRIM(
											ISNULL(coc.firstname, '''') + '' '' +
											ISNULL(coc.lastname, '''')
										))
									WHEN ISNULL(cc.CreatedBy, 0) = 0 THEN ''''
									ELSE
										LTRIM(RTRIM(
											ISNULL(e2.firstname, '''') + '' '' +
											CASE 
												WHEN ISNULL(e2.middlename, '''') <> '''' 
												THEN e2.middlename + '' '' 
												ELSE '''' 
											END +
											ISNULL(e2.lastname, '''')
										))
								 END AS Name
								,cc.CreatedDate AS time
								,ISNULL(cc.IsClient, 0) AS IsClient
							FROM ['+@DBNAME+'].dbo.[CallLog_Comments] cc WITH (NOLOCK)
							LEFT JOIN  ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e2 WITH(NOLOCK) 
								   ON cc.CreatedBy = e2.id
								   AND ISNULL(cc.IsClient, 0) = 0
							LEFT JOIN  ['+@DBNAME+'].dbo.[corp_cust] coc WITH(NOLOCK) 
								   ON cc.CreatedBy = coc.id
								   AND ISNULL(cc.IsClient, 0) = 1
							WHERE cc.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS comment		        
			';
			SET @SQL2 = ' 
				,ISNULL(c.ParentId, '''') AS parentId
				FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)		    
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
					  ON c.ProjectID = u.id
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
					  ON c.AppId = A.AppId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
					  ON c.InternalStatusID = s1.StatusID
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
					  ON c.ExternalStatusID = s2.StatusID
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
					  ON c.Priorityid = p.Priorityid
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
					  ON c.CallLogId = t.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Review_Form] cr WITH(NOLOCK)
					  ON cr.CallLogId = c.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
					  ON md1.id = c.DeptId
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
					  ON c.EmpId = e.id
				LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
					  ON c.createdby = e1.id
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Comments] cc WITH(NOLOCK)
					  ON cc.CallLogId = c.CallLogId
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_CallType] cct WITH(NOLOCK)
					  ON cct.Id = c.CallTypeId
				WHERE ISNULL(c.ProjectID,0)=@custid
				and c.IsActive = 1
			'

			IF CAST(@StartDate AS DATE)='1900-01-01'  SET @StartDate = '2000-01-01';
			IF CAST(@EndDate AS DATE)='1900-01-01' SET @EndDate = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE());

			-- Add filters to the query based on the parameters
			IF @Filter = 'Date'
				SET @SQL3 = ' AND CAST(c.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'CallStart'
				SET @SQL3 = ' AND CAST(c.StartDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF @Filter = 'CallClosed'
				SET @SQL3 = ' AND CAST(c.EndDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
			ELSE IF ISNULL(@Filter,'') = ''
				SET @SQL3 = ' AND CAST(c.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''';
		
			SET @SQL3 = ISNULL(@SQL3, '') + ' AND CAST(c.EntryDate AS DATE) >= DATEADD(DAY, -15, CAST(ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE()) AS DATE))';

			IF @StatusId IS NOT NULL AND @StatusId <> ''
				--SET @SQL4 = ' AND (c.InternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) +' OR c.ExternalStatusID =  '+ CONVERT(NVARCHAR(10), @StatusId, 0)+')';
			BEGIN
		    IF @StatusId IN (44, 45)
		    SET @SQL4 = ' AND (
			  c.InternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) +
			 ' OR c.ExternalStatusID IN (44, 45))';
		 ELSE
			 SET @SQL4 = ' AND (
					c.InternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) +
					' OR c.ExternalStatusID = ' + CONVERT(NVARCHAR(10), @StatusId, 0) + ')';
		END
			
			IF @ExternalStatusID IS NOT NULL AND ISNULL(@ExternalStatusID, 0) <> 0
				--SET @SQL5 = ' AND c.ExternalStatusID = '+ CONVERT(NVARCHAR(10), @ExternalStatusID, 0)+'';
			BEGIN
				IF @ExternalStatusID IN (44, 45)
					SET @SQL5 = ' AND c.ExternalStatusID IN (44, 45)';
				ELSE
					SET @SQL5 = ' AND c.ExternalStatusID = '+ CONVERT(NVARCHAR(10), @ExternalStatusID, 0);
			END

			-- Add search term filter
			IF @SearchTerm IS NOT NULL AND @SearchTerm <> ''
			BEGIN
				SET @SearchTerm = REPLACE(@SearchTerm, '''', '''''')
				SET @SQL5 = ' AND (
									c.CustomerName LIKE ''%' + @SearchTerm + '%'' OR 
									c.Descr LIKE ''%' + @SearchTerm + '%'' OR 
									c.CallDetails LIKE ''%' + @SearchTerm + '%'' OR 
									u.customercode LIKE ''%' + @SearchTerm + '%'' OR
									A.AppName LIKE ''%' + @SearchTerm + '%'' OR
									s1.Name LIKE ''%' + @SearchTerm + '%'' OR 
									s2.Name LIKE ''%' + @SearchTerm + '%'' OR 
									p.Name LIKE ''%' + @SearchTerm + '%'' OR
									t.TicketNo LIKE ''%' + @SearchTerm + '%'' OR 
									cr.Comments LIKE ''%' + @SearchTerm + '%'' OR 
									cc.Comments LIKE ''%' + @SearchTerm + '%'' OR 
									md1.Designationname LIKE ''%' + @SearchTerm + '%'' OR       
									LTRIM(RTRIM(ISNULL(e.firstname, '''') + '' '' + 
										CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END + 
										ISNULL(e.lastname, '''')
									)) LIKE ''%' + @SearchTerm + '%'' OR
									LTRIM(RTRIM(ISNULL(e1.firstname, '''') + '' '' + 
										CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END + 
										ISNULL(e1.lastname, '''')
									)) LIKE ''%' + @SearchTerm + '%''
								   )';
			END

			SET @SQL6 = '
			 GROUP BY 
					 c.CallLogId
					,c.EntryDate
					,u.customercode
					,c.CustomerName
					,ISNULL(A.appname, '''')
					,ISNULL(c.Descr, '''')
					,FORMAT(c.CreatedDate, ''HH:mm'')
					,ISNULL(e.firstname, '''')
					,ISNULL(e.middlename, '''')
					,e.middlename
					,ISNULL(e.lastname, '''')
					,ISNULL(s1.Name, '''')
					,ISNULL(s2.Name, '''')
					,ISNULL(c.Feedback, '''')
					,ISNULL(c.RatingByCustomer, 0)
					,ISNULL(c.RatingDateTime, '''')
					,ISNULL(c.TaskId, 0)
					,ISNULL(e1.firstname, '''')
					,ISNULL(e1.middlename, '''')
					,e1.middlename
					,ISNULL(e1.lastname, '''')
					,ISNULL(c.Source, '''')
					,ISNULL(p.Name, '''')
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''')
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''')
					,ISNULL(c.CallDetails, '''')
					,ISNULL(t.TicketNo, '''')
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''')
					,c.createdby
					,c.ParentId
					,c.EmpId
					,md1.Designationname
					,c.StartDate
					,c.EndDate
					,c.TotalPausedTime
					,ISNULL(cct.TypeName, '''')
				ORDER BY c.CallLogId DESC
				OFFSET ((' + LTRIM(RTRIM(STR(@Page))) + ' - 1) * ' + LTRIM(RTRIM(STR(@PageSize))) + ') ROWS
				FETCH NEXT ' + LTRIM(RTRIM(STR(@PageSize))) + ' ROWS ONLY;

				SELECT count(cul.CallLogId) FROM ['+@DBNAME+'].[dbo].[CallLog] cul WITH(NOLOCK)
				LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] sl1 WITH(NOLOCK)
					  ON cul.InternalStatusID = sl1.StatusID
				WHERE ISNULL(cul.ProjectID,0)=@custid
				AND cul.IsActive = 1
				AND (
					''' + @Filter + ''' <> ''Date''
					OR CAST(cul.EntryDate AS DATE) BETWEEN ''' + CONVERT(NVARCHAR(10), @StartDate, 120) + ''' AND ''' + CONVERT(NVARCHAR(10), @EndDate, 120) + '''
				)
				AND CAST(cul.EntryDate AS DATE) >= DATEADD(DAY, -15, CAST(ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE()) AS DATE))
				AND (
					--' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) +' = 0
					--OR cul.InternalStatusID = ' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) +'
					--OR cul.ExternalStatusID = ' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) +'
					 ' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) + ' = 0
					 OR (
				    ' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) + ' IN (44, 45)
				  AND (
		        cul.InternalStatusID = ' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) + '
			  OR cul.ExternalStatusID IN (44, 45)
				 )
				  )
				 OR (
	      ' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) + ' NOT IN (44, 45)
		    AND (
            cul.InternalStatusID = ' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) + '
            OR cul.ExternalStatusID = ' + CONVERT(NVARCHAR(10), ISNULL(@StatusId, 0)) + '
		   )
					 )
				);
			';

			PRINT (@SQL)
			PRINT (@SQL1)
			PRINT (@SQL2)
			PRINT (@SQL3)
			PRINT (@SQL4)
			PRINT (@SQL5)
			PRINT (@SQL6)

			EXEC (@SQL + @SQL1 + @SQL2 + @SQL3 + @SQL4 + @SQL5 + @SQL6);
	END
	ELSE IF(ISNULL(@mode,'')= 'FILTER')           
	BEGIN
		SET @SQL = '

			SELECT
				''COMPANYNAME'' type
				,id AS ProjectID
				--,customercode AS ProjectCode
				,(customercode + ''/'' + firmname) AS ProjectCode
			FROM ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] AS USM WITH (NOLOCK)
			WHERE ISNULL(Mastermanagement_roleid, 0) = 4
				AND ISNULL(IsActive, 0) = 1
				AND ISNULL(customercode,'''')<>''''
				AND ISNULL(IsDelete, 0) = 0
			ORDER BY id;
	------------------------------------------------------
			SELECT 
				  ''AppName'' type
				  , AppId
				  , AppName 
			FROM ['+@DBNAME+'].[dbo].[CallLog_AppName] WITH(NOLOCK)
			WHERE IsActive = 1
			ORDER BY DisplayOrder ASC;
	------------------------------------------------------
			SELECT  
				   ''Status'' type
				   , StatusID
				   ,Name 
			FROM ['+@DBNAME+'].dbo.[CallLog_status] WITH(NOLOCK)
			--WHERE IsActive = 1 AND StatusID  in (3,5,10, 12,13,14,15,16,17,18,19,20,21,22,24,27,44,45)
			WHERE IsActive = 1 AND StatusID  in (50, 52, 51, 53, 54, 55, 56, 14, 44, 34, 13)
	------------------------------------------------------
			SELECT  
				   ''PRIORITY'' type
				   ,PriorityID
				   ,Name 
			FROM ['+@DBNAME+'].dbo.[CallLog_Priority] WITH(NOLOCK)
			WHERE IsActive = 1
			ORDER BY DisplayOrder ASC;
	------------------------------------------------------			   
			 SELECT ''TRAININGTYPE'' type;
	------------------------------------------------------
			 SELECT 
		 		  ''TRAININGMODE'' type
		 		  ,mode 
			 FROM
				  (
		 			SELECT CAST(''ONLINE'' AS NVARCHAR(10)) AS mode
		 			UNION ALL
		 			SELECT CAST(''OFFLINE'' AS NVARCHAR(10)) AS mode
				  )  AS TrainingModeOptions;
	------------------------------------------------------
			SELECT  
				   ''Estatus'' type
				   ,StatusID
				   ,Name 
			FROM ['+@DBNAME+'].dbo.[CallLog_status] WITH(NOLOCK)
			WHERE IsActive = 1 and StatusID in(2,4,6,10,33,44,45,46,47, 48,49 );
	------------------------------------------------------
		   Select 
			
				 US.id
				,ISNULL(US.firmname,'''') AS CompanyName
				,CONCAT(ISNULL(CONVERT(NVARCHAR(11),US.JoiningDate,113),''''),'' '',ISNULL(US.city,'''')) AS SignUp
				,CONCAT(ISNULL(US.firstname,'''') ,'' '',ISNULL(US.lastname,'''') )AS [owner]
				,ISNULL(US.MasterManagement_BusinessClassname,'''') AS BusinessType
				,ISNULL(Package.PackageName,'''') AS Package
			--	,CAST(US.LastEditDate AS DATE) LastUpgradation
				,ISNULL(us.CustomerInstruction,'''') Flow
				,ISNULL(us.Instruction,'''') AdvanceFeatures
				,ISNULL(US.customercode,'''') AS CompanyCode
          
			FROM ['+@DBNAME+'].dbo.usermanagement_systemloginmaster AS US WITH(NOLOCK)	
			LEFT OUTER JOIN (
						SELECT id,PackageName FROM ['+@DBNAME+'].dbo.product_packageMaster WITH(NOLOCK)
					) AS Package
				ON Package.id = US.adhocpackageid		
			WHERE Mastermanagement_roleid IN (4,9) 
				AND ISNULL(IsDelete,0)=0					
				AND ISNULL(US.userid,'''')<>''''		
				AND ISNULL(IsDefaultCustomer,0)=0
			ORDER BY CONCAT(firstname,'' '',lastname) ASC;
	----------------------------------------------------------
		SELECT 
			Id
			,TypeName
		FROM ['+@DBNAME+'].[dbo].[CallLog_CallType] WITH (NOLOCK);

		SELECT 
			Id
			,Reason
		FROM ['+@DBNAME+'].[dbo].[CallLog_Reason] WITH (NOLOCK);
	'
		PRINT (@SQL)
		EXEC (@SQL)

	END
	ELSE IF(ISNULL(@mode,'')='WABACHECKCORP')
	BEGIN
		SET @SQL ='
			DECLARE @UserPhone NVARCHAR(50) = ''' + RIGHT(CONVERT(NVARCHAR(50), ISNULL(@UserPhone, '''')), 10) + ''',
					@CorpId INT = 0,
					@CompanyId INT,
					@CompanyCode nvarchar(255),
					@Message NVARCHAR(900);

			SELECT TOP 1
				@CorpId = ISNULL(coc.id, 0),
				@CompanyId = ISNULL(coc.custid, 0),
				@CompanyCode = usl.customercode
			FROM ['+@DBNAME+'].[dbo].[corp_cust] coc WITH(NOLOCK)
			INNER JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] usl WITH (NOLOCK)
				ON usl.Id = coc.custid
			WHERE RIGHT(CONVERT(NVARCHAR(50), ISNULL(coc.mobile, '''')), 10) = @UserPhone;

			IF(@CorpId = 0)
			BEGIN
				SELECT
					1 AS stat,
					''Please contact us using a registered number. To register this number, kindly ask your administrator to get it registered with us.'' AS WabaMessage,
					1000 AS stat_code;
			END
			ELSE
			BEGIN
				SELECT
					0 AS stat,
					''next'' AS condation,
					1001 AS stat_code;
			END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF(ISNULL(@mode,'')='WABAGETCALL')
	BEGIN
		SET @SQL ='
			DECLARE @UserPhone NVARCHAR(50) = ''' + RIGHT(CONVERT(NVARCHAR(50), ISNULL(@UserPhone, '''')), 10) + ''',
					@CallLogId INT = 0,
					@CorpId INT,
					@CompanyId INT,
					@CompanyCode nvarchar(255),
					@Descr NVARCHAR(MAX),
					@Status NVARCHAR(50),
					@AppName NVARCHAR(50),
					@Date NVARCHAR(100),
					@Message NVARCHAR(900);

				SELECT TOP 1
					@CorpId = coc.id,
					@CompanyId = coc.custid,
					@CompanyCode = usl.customercode
				FROM ['+@DBNAME+'].[dbo].[corp_cust] coc WITH(NOLOCK)
				INNER JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] usl WITH (NOLOCK)
					ON usl.Id = coc.custid
				WHERE RIGHT(CONVERT(NVARCHAR(50), ISNULL(coc.mobile, '''')), 10) = @UserPhone;

				SELECT @Message =
					LEFT(
						N''*Your Previous Support Request:*''
						+ CHAR(13) + CHAR(10)
						+ ISNULL(
							STRING_AGG(
								CAST(
									N''*Topic:* ''
									+ LEFT(ISNULL(CAST(C.Descr AS NVARCHAR(MAX)), N''''), 400)
									+ CHAR(13) + CHAR(10)
									+ N''*Status:* ''
									+ LEFT(ISNULL(CAST(C.StatusName AS NVARCHAR(MAX)), N''''), 100)
									AS NVARCHAR(MAX)
								),
								CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10)
							) WITHIN GROUP (ORDER BY C.CallLogId DESC),
							N''Call Not Found''
						),
						1024
					)
				FROM
				(
					SELECT TOP 5
						cl.CallLogId,
						cl.Descr,
						ISNULL(cst.Name, N'''') AS StatusName
					FROM [' + @DBNAME + '].[dbo].[CallLog] cl WITH (NOLOCK)
					LEFT JOIN [' + @DBNAME + '].[dbo].[CallLog_status] cst WITH (NOLOCK)
						ON cst.StatusID = cl.ExternalStatusID
					WHERE cl.ProjectID = @CompanyId
					AND ISNULL(cl.ExternalStatusID, 44) in (44, 45, 33)
					ORDER BY cl.CallLogId DESC, cl.EntryDate DESC
				) C;

				IF (@Message <> N''Call Not Found'')
				BEGIN
					SELECT
						1 AS stat,
						@Message AS WabaMessage,
						100 AS stat_code;
				END
				ELSE
				BEGIN
					SELECT
						0 AS stat,
						N''Call Not Found'' AS stat_msg,
						N'''' AS WabaMessage,
						1001 AS stat_code;
				END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	Else IF(ISNULL(@mode,'')='WABAADDCALL')
	BEGIN
		SET @SQL = '
			DECLARE @UserPhone NVARCHAR(50) = ''' + RIGHT(CONVERT(NVARCHAR(50), ISNULL(@UserPhone, '''')), 10) + ''',
					@Descr NVARCHAR(MAX) = '''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Descr)), '')), '''', '''''') +''',
					@IsClient INT = '+convert(nvarchar(255),isnull(@IsClient,0)) +',
					@CompanyId INT = 0,
					@CorpId INT = 0,
					@CompanyCode NVARCHAR(50) = '''',
					@CustomerName NVARCHAR(100) = '''',
					@callLogautoIncrement INT;
			SELECT TOP 1
				@CorpId = coc.id,
				@CompanyId = coc.custid,
				@CustomerName = LTRIM(RTRIM(
									LTRIM(RTRIM(ISNULL(coc.firstname, ''''))) + '' '' +
									LTRIM(RTRIM(ISNULL(coc.lastname, '''')))
								)),
				@CompanyCode = usl.customercode
			FROM ['+@DBNAME+'].[dbo].[corp_cust] coc WITH(NOLOCK)
			INNER JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] usl WITH (NOLOCK)
				ON usl.Id = coc.custid
			WHERE RIGHT(CONVERT(NVARCHAR(50), ISNULL(coc.mobile, '''')), 10) = @UserPhone;

			SET @callLogautoIncrement = ISNULL((SELECT MAX(CallLogId) FROM ['+ @DBNAME+'].[dbo].[CallLog] WITH(NOLOCK)), 0) + 1;

			INSERT INTO ['+@DBNAME+'].dbo.[CallLog] (
				CallLogId ,EntryDate ,CustomerName ,ProjectID , AppId ,Descr ,Source ,CreatedDate 
				,IsActive ,ProjectCode ,CreatedByCode ,IsClient ,CorpId ,ExternalStatusID, CreatedBy
			) VALUES ( 
				@callLogautoIncrement
				,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
				,@CustomerName
				,@CompanyId
				,0
				,@Descr
				,''WhatsApp''
				,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
				,1
				,@CompanyCode
				,''' + @DBNAME + '''
				,@IsClient
				,@CorpId
				,44
				,0
			)

			SELECT
				1 as stat
				,@Descr as WabaMessage
				,1000 as stat_code;

			SELECT DISTINCT TOP 1
					c.CallLogId sr
					,c.EntryDate date
					,u.customercode company
					,c.CustomerName callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr,'''') description
					,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
						  ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname,'''')  AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name,'''') AS status
					,ISNULL(s2.Name,'''') AS Estatus				
					,ISNULL(c.Feedback,'''') AS feedback
					,ISNULL(c.RatingByCustomer,0) AS rating
					,c.Source topicRaisedBy
					,ISNULL(p.Name,'''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed
			';
			PRINT(@SQL)
			SET @SQL1 = '
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
						), ''00:00:00''), 108)
					,'''') AS CallDuration
					,ISNULL(c.CallDetails,'''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
					,ISNULL(c.ParentId,'''') parentId
					,ISNULL(REPLACE(
						  (
							SELECT 
								 cc.Id AS id
								,ISNULL(cc.Comments,'''') AS text
								,ISNULL(cc.FilePath,'''') AS img
								,CASE 
									WHEN ISNULL(cc.IsClient, 0) = 1 THEN
										LTRIM(RTRIM(
											ISNULL(coc.firstname, '''') + '' '' +
											ISNULL(coc.lastname, '''')
										))
									WHEN ISNULL(cc.CreatedBy, 0) = 0 THEN ''''
									ELSE
										LTRIM(RTRIM(
											ISNULL(e2.firstname, '''') + '' '' +
											CASE 
												WHEN ISNULL(e2.middlename, '''') <> '''' 
												THEN e2.middlename + '' '' 
												ELSE '''' 
											END +
											ISNULL(e2.lastname, '''')
										))
								 END AS Name
								,cc.CreatedDate AS time
								,ISNULL(cc.IsClient, 0) AS IsClient
							FROM ['+@DBNAME +'].dbo.[CallLog_Comments] cc WITH (NOLOCK)
							LEFT JOIN  ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e2 WITH(NOLOCK) 
								   ON cc.CreatedBy = e2.id
								    AND ISNULL(cc.IsClient, 0) = 0
							LEFT JOIN  ['+@DBNAME+'].dbo.[corp_cust] coc WITH(NOLOCK) 
								   ON cc.CreatedBy = coc.id
								   AND ISNULL(cc.IsClient, 0) = 1
							WHERE cc.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS comment
				 FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)						
				 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			  		  ON c.ProjectID = u.id
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 		  ON c.AppId = A.AppId
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 		  ON c.InternalStatusID = s1.StatusID
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 		  ON c.ExternalStatusID = s2.StatusID
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 		  ON c.Priorityid = p.Priorityid			
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 		  ON c.CallLogId = t.CallLogId			
				 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 		  ON md1.id = c.DeptId
				 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
			 		  ON c.EmpId = e.id
				 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 		  ON c.createdby = e1.id		
				 WHERE c.IsActive = 1 
				 AND c.CalllogId = @callLogautoIncrement
				 GROUP BY 
					c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
					c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
					s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
					c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
					t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
					c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname
		';
		PRINT(@SQL1)
		EXEC(@SQL+@SQL1)
	END
	Else IF(ISNULL(@mode,'')='ADDCALL')
	BEGIN
		IF (ISNULL(@Source,'') = 'Callback') 
		SET @CreatedBy = 0

		 SET @SQL ='
					DECLARE @InsertedId INT;
					DECLARE @ProjectCode NVARCHAR(100);
					DECLARE @InternalProjectId INT;

					IF ' + CONVERT(NVARCHAR(1), ISNULL(@IsClient, 0)) + ' = 1
					BEGIN
						SELECT @InternalProjectId = id
						FROM [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] WITH(NOLOCK)
						WHERE customercode = ''' + @DBNAME + ''';
					END
					ELSE
					BEGIN
						SET @InternalProjectId = '+convert(nvarchar(255),isnull(@ProjectId,0)) +';
					END
					SELECT 
						@ProjectCode = customercode 
					FROM ['+ @DBNAME +'].[dbo].[Usermanagement_systemloginmaster] WITH(NOLOCK)
					WHERE id = @InternalProjectId;

					DECLARE @callLogautoIncrement INT = ISNULL((SELECT MAX(CallLogId) FROM [' + @DBNAME + '].[dbo].[CallLog]), 0) + 1;

					INSERT INTO ['+@DBNAME+'].dbo.[CallLog] 
						   (
					   		CallLogId
							 ,EntryDate
							 ,CustomerName
							 ,ProjectID
							 ,AppId
							 ,Descr
							 ,DeptId
							 ,EmpId
							 ,Source
							 ,CreatedBy
					   		 ,CreatedDate
							 ,IsActive
							 ,ProjectCode
							 ,CreatedByCode
							 ,IsClient
							 ,CorpId
							 ,CallTypeId
							 ,ExternalStatusID
						   )
					VALUES ( 
							@callLogautoIncrement
							,'''+CONVERT(NVARCHAR(30), @EntryDate, 120)+'''
							,'''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@CustomerName)), '')), '''', '''''')+'''
							,  '+convert(nvarchar(10),@ProjectID)+'
							,  '+CONVERT(NVARCHAR(MAX),ISNULL(@AppId ,0))+'
							,'''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Descr)), '')), '''', '''''') +''' 
							,  '+CONVERT(NVARCHAR(255),ISNULL(@DeptId, 0))+'
							,  '+CONVERT(NVARCHAR(255),ISNULL(@EmpId, 0))+'
							,'''+CONVERT(NVARCHAR(255),ISNULL(RTRIM(LTRIM(@Source)),''''))+'''
							,  '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+'
							,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							,1
							,@ProjectCode
							,''' + @DBNAME + '''
							,'+convert(nvarchar(255),isnull(@IsClient,0)) +'
							,'+convert(nvarchar(255),isnull(@CorpId,0)) +'
							,'+convert(nvarchar(255),isnull(@CallTypeId,0)) +'
							,44
						   )			
					SELECT  
						 1 as stat
						,''Call Added successfully'' as stat_msg
						,1000 as stat_code	
					

				 --SET  @InsertedId  = SCOPE_IDENTITY();
				 SET  @InsertedId  = ISNULL((SELECT MAX(CallLogId) FROM [' + @DBNAME + '].[dbo].[CallLog]), 0);
				-- SELECT @InsertedId as CallLogId
				'
			SET @SQL1='
			
				IF (ISNULL('''+CONVERT(NVARCHAR(Max),ISNULL(RTRIM(LTRIM(@FilePath)),''''))+''', '''') <> '''' OR ISNULL('''+REPLACE(CONVERT(NVARCHAR(max), ISNULL(RTRIM(LTRIM(@Comments)),'''')), '''', '''''')+''', '''') <> '''')
				BEGIN
					INSERT INTO ['+@DBNAME+'].dbo.[CallLog_Comments] 
						( 
							CallLogId
							,Comments
							,Filepath
							,CreatedBy
							,CreatedDate
							,IsClient
						)
					VALUES( 
							@InsertedId
							,'''+REPLACE(CONVERT(NVARCHAR(max), ISNULL(RTRIM(LTRIM(@Comments)),'')), '''', '''''')+'''
							,'''+CONVERT(NVARCHAR(Max),ISNULL(RTRIM(LTRIM(@FilePath)),''''))+'''
							,'+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+'
							,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							,'+CONVERT(NVARCHAR(255),ISNULL(@IsClient,0))+'
						)
				END
				DECLARE @trackingautoIncrement INT = ISNULL((SELECT MAX(LogId) FROM [' + @DBNAME + '].[dbo].[CallLog_tracking]), 0) + 1;

				 INSERT INTO ['+@DBNAME+'].dbo.[CallLog_tracking] 
						   (
					   		LogId
							 ,CallLogId
							 ,EntryDate
							 ,CustomerName
							 ,ProjectID
							 ,AppId
							 ,Descr
							 ,DeptId
							 ,EmpId
							 ,Source
							 ,CreatedBy
							 ,CreatedDate
							)
					VALUES (
							@trackingautoIncrement
							  ,@InsertedId
							  ,'''+CONVERT(NVARCHAR(30), @EntryDate, 120)+'''
							  ,'''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@CustomerName)), '')), '''', '''''')+'''
							  ,  '+CONVERT(NVARCHAR(255),ISNULL(@ProjectID,0))+'
							  ,  '+CONVERT(NVARCHAR(MAX),ISNULL(@AppId ,0))+'
							  ,'''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Descr)), '')), '''', '''''') +''' 
							  ,  '+CONVERT(NVARCHAR(255),ISNULL(@DeptId, 0))+'
							  ,  '+CONVERT(NVARCHAR(255),ISNULL(@EmpId, 0))+'
							  ,'''+CONVERT(NVARCHAR(255),ISNULL(RTRIM(LTRIM(@Source)),''''))+'''
							  ,  '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+'                                                                    
							 ,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						  )

				 SELECT DISTINCT TOP 1
					 c.CallLogId sr
					,c.EntryDate date
					,u.customercode company
					,c.CustomerName callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr,'''') description
					,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
						  ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname,'''')  AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name,'''') AS status
					,ISNULL(s2.Name,'''') AS Estatus				
					,ISNULL(c.Feedback,'''') AS feedback
					,ISNULL(c.RatingByCustomer,0) AS rating
					,c.Source topicRaisedBy
					,ISNULL(p.Name,'''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed	
					'
				SET @SQL2 ='
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
						), ''00:00:00''), 108)
					,'''') AS CallDuration
					,ISNULL(c.CallDetails,'''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
					,ISNULL(c.ParentId,'''') parentId
					,ISNULL(REPLACE(
						  (
							SELECT 
								 cc.Id AS id
								,ISNULL(cc.Comments,'''') AS text
								,ISNULL(cc.FilePath,'''') AS img
								,CASE 
									WHEN ISNULL(cc.IsClient, 0) = 1 THEN
										LTRIM(RTRIM(
											ISNULL(coc.firstname, '''') + '' '' +
											ISNULL(coc.lastname, '''')
										))
									WHEN ISNULL(cc.CreatedBy, 0) = 0 THEN ''''
									ELSE
										LTRIM(RTRIM(
											ISNULL(e2.firstname, '''') + '' '' +
											CASE 
												WHEN ISNULL(e2.middlename, '''') <> '''' 
												THEN e2.middlename + '' '' 
												ELSE '''' 
											END +
											ISNULL(e2.lastname, '''')
										))
								 END AS Name
								,cc.CreatedDate AS time
								,ISNULL(cc.IsClient, 0) AS IsClient
							FROM ['+@DBNAME +'].dbo.[CallLog_Comments] cc WITH (NOLOCK)
							LEFT JOIN  ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e2 WITH(NOLOCK) 
								   ON cc.CreatedBy = e2.id
								    AND ISNULL(cc.IsClient, 0) = 0
							LEFT JOIN  ['+@DBNAME+'].dbo.[corp_cust] coc WITH(NOLOCK) 
								   ON cc.CreatedBy = coc.id
								   AND ISNULL(cc.IsClient, 0) = 1
							WHERE cc.CallLogId = c.CallLogId
							FOR JSON PATH
						  ),''\/'', ''/''),'''') AS comment
			
				 FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)						
				 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			  		  ON c.ProjectID = u.id
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 		  ON c.AppId = A.AppId
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 		  ON c.InternalStatusID = s1.StatusID
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 		  ON c.ExternalStatusID = s2.StatusID
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 		  ON c.Priorityid = p.Priorityid			
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 		  ON c.CallLogId = t.CallLogId			
				 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 		  ON md1.id = c.DeptId
				 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
			 		  ON c.EmpId = e.id
				 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 		  ON c.createdby = e1.id		
				 WHERE c.IsActive = 1 AND c.CalllogId = @InsertedId
				'
				 
				SET @SQL3 = '			  
				  GROUP BY 
						  c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
						  c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
						  s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
						  c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
						  t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
						  c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname			
				'

				PRINT(@SQL)
				PRINT(@SQL1)
				PRINT(@SQL2)
				PRINT(@SQL3)
				EXEC (@SQL+@SQL1+@SQL2+@SQL3)
	END
	ELSE IF(ISNULL(@mode,'')='ACCEPTCALL')
	BEGIN
			SET @SQL=' 	   
				 IF EXISTS(SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CreatedBy = 0 AND CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'	)
				 BEGIN 
					  DECLARE @ProjectId INT, @ResolvedProjectCode NVARCHAR(MAX), @AgentName NVARCHAR(MAX), @CreatedByCode NVARCHAR(255);

					  SELECT 
						@ProjectId = ISNULL(ProjectID, 0)
						,@ResolvedProjectCode = ISNULL(ProjectCode, '''')
						,@CreatedByCode = ISNULL(CreatedByCode, '''')
					  FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK)
					  WHERE CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+';

					  SELECT @AgentName = LTRIM(RTRIM(ISNULL(firstname, '''') + '' '' + ISNULL(lastname, '''')))
					  FROM ['+ @DBNAME +'].[dbo].[Usermanagement_systemloginmaster] WITH(NOLOCK)
					  WHERE id = '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0)) +';
			'
			SET @SQL1 = '
					  UPDATE c 
	         			SET c.CreatedBy = '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0)) +'
						,c.CreatedByCode = ''' + @DBNAME + '''
	         			FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)
	         			WHERE c.CreatedBy = 0 AND c.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+';
			'
			SET @SQL2 = '
					  -- Notification Logic
					  DECLARE @onesignal_SubPlayid NVARCHAR(MAX),
							  @Onesignal_Appid NVARCHAR(255),
							  @Onesignal_RestApiKey NVARCHAR(255),
							  @NotificationContent NVARCHAR(MAX),
							  @AppRegId_Internal INT;

					  SET @NotificationContent = ''Your request is accepted by '' + ISNULL(@AgentName, ''Support Agent'') + ''.'';

					  INSERT INTO ['+@DBNAME+'].[dbo].[CSystem_Notification](
						CompanyCode, CompanyId, FromUserId, Title, Message, Module, EntryDate
					  ) values (
						@ResolvedProjectCode, @ProjectId, '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0)) +', ''Request Accepted'', @NotificationContent, ''call'', ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
					  );

					  SELECT @AppRegId_Internal = appid FROM [404146_CentralUser].[dbo].[Appmanagement_AppMaster] WITH(NOLOCK) WHERE appname = ''Optigo Carely'';

					  SELECT @Onesignal_Appid = Onesignal_Appid, @Onesignal_RestApiKey = Onesignal_RestApiKey
					  FROM [404146_CentralUser].[dbo].[Onesignal_AppDetail] WITH(NOLOCK)
					  WHERE Onesignal_AppName = ''Optigo Carely'';

					  SELECT @onesignal_SubPlayid = ''['' + STRING_AGG(''"'' + osl.onesignal_SubPlayid + ''"'', '','') + '']''
					  FROM [404146_CentralUser].[dbo].[onesignallist] AS osl WITH(NOLOCK)
					  INNER JOIN [404146_CentralUser].[dbo].[Appmanagement_Device] AS Ad WITH(NOLOCK)
						  ON Ad.SystemLoginId = osl.SystemLoginid AND Ad.DeviceId = osl.deviceid
					  WHERE osl.SystemLoginid IN (SELECT id FROM [' + @DBNAME + '].dbo.[corp_cust] WHERE custid = @ProjectId)
					  AND Ad.AppId = @AppRegId_Internal
					  AND Ad.IsEnable = 1
					  AND osl.dbname = @CreatedByCode;

	         			SELECT  
	         				1 as stat
	         				,''Call accepted successfully.'' as stat_msg
	         				,1000 as stat_code
							,@onesignal_SubPlayid AS Onesignal_SubPlayid
							,@Onesignal_Appid AS Onesignal_Appid
							,@Onesignal_RestApiKey AS Onesignal_RestApiKey
							,''call'' AS Module
							,'+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+' AS CallLogid
							,''Request Accepted'' AS Heading
							,@NotificationContent AS Content;
				 END
				 ELSE
				 BEGIN
	         			SELECT  
	         				  0 as stat
	         				  ,''CallLogId does not exist or this call has already been accepted.'' as stat_msg
	         				  ,1001 as stat_code;
				 END
			'
			SET @SQL3 = '

					SELECT DISTINCT TOP 1
						c.CallLogId sr
						,c.EntryDate date
						,u.customercode company
						,c.CustomerName callBy
						,ISNULL(A.appname,'''') appname
						,ISNULL(c.Descr,'''') description
						,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
							ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
								CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
								ISNULL(e1.lastname, '''')
							)) 
						END AS receivedBy
						,FORMAT(c.CreatedDate, ''HH:mm'') AS time
						,ISNULL(md1.Designationname,'''')  AS DeptName
						,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
						CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
						END AS AssignedEmpName
						,ISNULL(s1.Name,'''') AS status
						,ISNULL(s2.Name,'''') AS Estatus				
						,ISNULL(c.Feedback,'''') AS feedback
						,ISNULL(c.RatingByCustomer,0) AS rating
						,c.Source topicRaisedBy
						,ISNULL(p.Name,'''') AS priority
						,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
						,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed
						,ISNULL(
						CONVERT(VARCHAR(8), 
						DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
							ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
							ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
							ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
						), ''00:00:00''), 108)
						,'''') AS CallDuration
						,ISNULL(c.CallDetails,'''') AS callDetails
						,ISNULL(t.TicketNo, '''') AS ticket
						,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
						,ISNULL(c.ParentId,'''') parentId

					 FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)						
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			  			  ON c.ProjectID = u.id
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 			  ON c.AppId = A.AppId
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 			  ON c.InternalStatusID = s1.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 			  ON c.ExternalStatusID = s2.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 			  ON c.Priorityid = p.Priorityid			
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 			  ON c.CallLogId = t.CallLogId			
					 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 			  ON md1.id = c.DeptId
					 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
			 			  ON c.EmpId = e.id
					 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 			  ON c.createdby = e1.id		
					 WHERE c.IsActive = 1 AND c.CalllogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'
					GROUP BY 
						  c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
						  c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
						  s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
						  c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
						  t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
						  c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname
			'
	   
		   PRINT (@SQL)
		   PRINT (@SQL1)
		   PRINT (@SQL2)
		   PRINT (@SQL3)
		   EXEC (@SQL + @SQL1 + @SQL2 + @SQL3)
	END
	ELSE IF(ISNULL(@mode,'')='CALLSTART') 
	BEGIN
			SET @SQL ='

				 DECLARE @ErrorMsg NVARCHAR(200) = ''''
				 IF NOT EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND IsActive = 1)	
				 BEGIN
					 SET @ErrorMsg += ''CallLogId does not exists. '';
				 END
				 ELSE           
				 IF NOT EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND (CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
								 OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ')  AND IsActive = 1 )
				 BEGIN
					 SET @ErrorMsg += ''You cannot start this call.'';      		
				 END

				 IF LEN(@ErrorMsg) > 0
				 BEGIN
					 SELECT 
						   0 AS stat
						  ,@ErrorMsg AS stat_msg
						  ,1001 as stat_code;						  
					 RETURN;
				 END'
			SET @SQL1 ='
				 IF EXISTS (SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND (CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
							   OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ') AND IsActive = 1)
				 BEGIN
						 UPDATE c						
						 SET  c.StartDate    = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							 ,c.UpdatedBy    = '+ CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+'
							 ,c.ModifiedDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							 ,c.ExternalStatusID=45
						 FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)
						 WHERE c.CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+'  
						 AND IsActive = 1;
				
					DECLARE @trackingautoIncrement INT = ISNULL((SELECT MAX(LogId) FROM [' + @DBNAME + '].[dbo].[CallLog_tracking]), 0) + 1;

					 INSERT INTO ['+@DBNAME+'].dbo.[CallLog_tracking] 
						   (
					   		 LogId
							 ,CallLogId                       
							 ,StartDate
							 ,CreatedBy
							 ,CreatedDate
						   )
					VALUES (
							@trackingautoIncrement
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
							 , ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
							 ,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						  )
						 SELECT 
							  1 as stat
							,''Updated the start date'' as stat_msg
							,1000 as stat_code	
				'

				SET @SQL2 ='
				 SELECT DISTINCT TOP 1
					 c.CallLogId sr
					,c.EntryDate date
					,u.customercode company
					,c.CustomerName callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr,'''') description
					,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
						  ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname,'''')  AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name,'''') AS status
					,ISNULL(s2.Name,'''') AS Estatus				
					,ISNULL(c.Feedback,'''') AS feedback
					,ISNULL(c.RatingByCustomer,0) AS rating
					,c.Source topicRaisedBy
					,ISNULL(p.Name,'''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed			  
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
							), ''00:00:00''), 108),
					'''') AS CallDuration
					,ISNULL(c.CallDetails,'''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
					,ISNULL(c.ParentId,'''') parentId'

		SET @SQL3 ='   
				 FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)						
				 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			 		  ON c.ProjectID = u.id
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 		  ON c.AppId = A.AppId
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 		  ON c.InternalStatusID = s1.StatusID
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 		  ON c.ExternalStatusID = s2.StatusID
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 		  ON c.Priorityid = p.Priorityid			
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 		  ON c.CallLogId = t.CallLogId			
				 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 		  ON md1.id = c.DeptId
				 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
			 		  ON c.EmpId = e.id
				 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 		  ON c.createdby = e1.id		
				 WHERE c.IsActive = 1 AND c.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'

				 GROUP BY 
						  c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
						  c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
						  s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
						  c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
						  t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
						  c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname
				END
				ELSE
				BEGIN
					  SELECT 
							 0 as stat
							,''CallLogId is deleted.'' as stat_msg
							,1001 as stat_code	
				END'
					

				PRINT(@SQL)
				PRINT(@SQL1)
				PRINT(@SQL2)
				PRINT(@SQL3)
				EXEC(@SQL
				   + @SQL1
				   + @SQL2
				   + @SQL3
					)
	END
	ELSE IF (ISNULL(@mode,'')='CALLPAUSE')
	BEGIN
		  SET @SQL ='
				  IF EXISTS (SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND IsActive = 1)
	  			  BEGIN
	  					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_PauseLog]
	  						(
	  						  CallLogId
	  						 ,PauseStart
	  						)
	  					VALUES 
	  						(
	  						  '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+'
	  						 ,ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
	  						)
	  
	  		  			SELECT
	  						1 as stat
	  						,''Current call Paused.'' as stat_msg
	  						,1000 as stat_code	
	  			  END
	  			  ELSE
	  			  BEGIN
	  		  			SELECT
	  		  				0 as stat
	  		  			   ,''CallLogId does not exists.'' as stat_msg
	  		  			   ,1001 as stat_code
	  			  END'
	  		PRINT(@SQL)
	  		EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode,'')='CALLRESUME')
	BEGIN
		 SET @SQL ='
				  IF EXISTS (SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND IsActive = 1)
				  BEGIN

						UPDATE cp
						SET cp.PauseEnd = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
						FROM ['+@DBNAME+'].[dbo].[CallLog_PauseLog] cp 
						WHERE cp.CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND cp.PauseEnd IS NULL

						SELECT
							1 as stat
							,''Current call Resumed.'' as stat_msg
							,1000 as stat_code	
					END
					ELSE
					BEGIN
						SELECT
							 0 as stat
							,''CallLogId does not exists '' as stat_msg
							,1001 as stat_code
					END'
			PRINT(@SQL)
			EXEC(@SQL)

	END
	ELSE IF(ISNULL(@mode,'')='CALLEND')
	BEGIN
			SET @SQL ='
				DECLARE @ErrorMsg NVARCHAR(200) = ''''
				IF NOT EXISTS (
					SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] 
					WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND IsActive = 1
				)	
				BEGIN
					SET @ErrorMsg += ''CallLogId does not exists. '';
				END
				ELSE           
				IF NOT EXISTS (
					SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog]
					WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' 
					AND (
						CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
						OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
					)
					AND IsActive = 1
				)
				BEGIN
					SET @ErrorMsg += ''You are not authorized to END this call.'';               		
				END
			
				IF LEN(@ErrorMsg) > 0
				BEGIN
					SELECT 
						 0 AS stat
						,@ErrorMsg AS stat_msg
						,1001 as stat_code;						  
					RETURN;
				END

				IF EXISTS (SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND (CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
							   OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ')  AND IsActive = 1 )
				BEGIN
					  DECLARE @TotalPausedSeconds INT;
				  
					  SELECT @TotalPausedSeconds = SUM(DATEDIFF(SECOND, PauseStart, PauseEnd))
					  FROM ['+@DBNAME+'].[dbo].[CallLog_PauseLog] WITH(NOLOCK)
					  WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' ;
				  
					  DECLARE @TotalPausedTime NVARCHAR(8) = CONVERT(VARCHAR(8), DATEADD(SECOND, ISNULL(@TotalPausedSeconds, 0), ''00:00:00''), 108);
				  
					  UPDATE c 
					  SET    
						   c.EndDate         = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						  ,c.TotalPausedtime = ISNULL(@TotalPausedTime, ''00:00:00'')
						  ,c.UpdatedBy		 = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
						  ,c.ModifiedDate	 = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						  --,c.ExternalStatusID=47
					  FROM 
						  ['+@DBNAME+'].[dbo].[CallLog] c WITH(NOLOCK)
					  WHERE
						  c.CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+'  AND c.IsActive = 1;

					DECLARE @trackingautoIncrement INT = ISNULL((SELECT MAX(LogId) FROM [' + @DBNAME + '].[dbo].[CallLog_tracking]), 0) + 1;
			';
			PRINT(@SQL)
			SET @SQL1 = '
					 INSERT INTO ['+@DBNAME+'].dbo.[CallLog_tracking] 
						   (
					   		LogId
							 ,CallLogId
							 ,EndDate
							 ,TotalPausedtime
							 ,CreatedBy
							 ,CreatedDate
						   )
					 VALUES (
				 			 @trackingautoIncrement
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '  
							 ,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
							 ,ISNULL(@TotalPausedTime, ''00:00:00'')                  
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
							 ,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						  )

					 SELECT
						   1 AS stat
						  ,''Updated the End date'' AS stat_msg
						  ,1000 AS stat_code;

					SELECT DISTINCT TOP 1
						 c.CallLogId sr
						,c.EntryDate date
						,u.customercode company
						,c.CustomerName callBy
						,ISNULL(A.appname,'''') appname
						,ISNULL(c.Descr,'''') description
						,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
							  ELSE LTRIM(RTRIM(
								ISNULL(e1.firstname, '''') + '' '' +
								CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
								ISNULL(e1.lastname, '''')
							)) 
						 END AS receivedBy
						,FORMAT(c.CreatedDate, ''HH:mm'') AS time
						,ISNULL(md1.Designationname,'''')  AS DeptName
						,CASE 
							WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
							ELSE LTRIM(RTRIM(
								ISNULL(e.firstname, '''') + '' '' +
								CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
								ISNULL(e.lastname, '''')
							)) 
						 END AS AssignedEmpName
						,ISNULL(s1.Name,'''') AS status
						,ISNULL(s2.Name,'''') AS Estatus				
						,ISNULL(c.Feedback,'''') AS feedback
						,ISNULL(c.RatingByCustomer,0) AS rating
						,c.Source topicRaisedBy
						,ISNULL(p.Name,'''') AS priority
						,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
						,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed			  
						,ISNULL(
							CONVERT(VARCHAR(8), 
								DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
									ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
									ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
									ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
								), ''00:00:00''), 108),
						'''') AS CallDuration
						,ISNULL(c.CallDetails,'''') AS callDetails
						,ISNULL(t.TicketNo, '''') AS ticket
						,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
						,ISNULL(c.ParentId,'''') parentId
					FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)
			';
			PRINT(@SQL1)
			SET @SQL2 = '
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			 			  ON c.ProjectID = u.id
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 			  ON c.AppId = A.AppId
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 			  ON c.InternalStatusID = s1.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 			  ON c.ExternalStatusID = s2.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 			  ON c.Priorityid = p.Priorityid			
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 			  ON c.CallLogId = t.CallLogId			
					 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 			  ON md1.id = c.DeptId
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK)
			 			  ON c.EmpId = e.id
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 			  ON c.createdby = e1.id		
					 WHERE c.IsActive = 1 AND c.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'
					 GROUP BY
							  c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
							  c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
							  s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
							  c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
							  t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
							  c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname
				 END
				 ELSE
				 BEGIN
					  SELECT
						   0 AS stat
						  ,''CallLogId does not exists'' AS stat_msg
						  ,1001 AS stat_code;
				 END
		';
		PRINT(@SQL2)
		EXEC(@SQL+@SQL1+@SQL2)

	END
	ELSE IF(ISNULL(@mode,'')='CALL_TIME_EDIT')
	BEGIN
		 SET @SQL ='
				IF EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+')
				BEGIN
						UPDATE cl
						SET  
							cl.StartDate = ' + 
								CASE 
									WHEN @StartDateTime IS NOT NULL 
									THEN '''' + CONVERT(NVARCHAR(30), @StartDateTime, 120) + '''' 
									ELSE 'NULL' 
								END + ',
							cl.EndDate = ' + 
								CASE 
									WHEN @EndDateTime IS NOT NULL 
									THEN '''' + CONVERT(NVARCHAR(30), @EndDateTime, 120) + '''' 
									ELSE 'NULL' 
								END + ',
							cl.ModifiedDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						FROM [' + @DBNAME + '].[dbo].[CallLog] cl WITH(NOLOCK)
						WHERE cl.CallLogId = ' + CONVERT(NVARCHAR(20), ISNULL(@CallLogid, 0)) + ';

					 SELECT 
						 1 AS stat 
						,''Time Edit successfully.'' AS stat_msg 
						,1000 AS stat_code;
				END
				ELSE
				BEGIN
					SELECT
						0 AS stat
						,''Call does not exists'' AS stat_msg
						,1001 AS stat_code;
				END
		 ';
		 PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode, '')='EDIT')
	BEGIN
		SET @SQL = '
				DECLARE @ErrorMsg NVARCHAR(200) = ''''
				IF NOT EXISTS (
					SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] 
					WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' 
					AND IsActive = 1
				)
				BEGIN
					SET @ErrorMsg += ''CallLogId does not exists. '';
				END
				ELSE           
				IF NOT EXISTS (
					SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog]
					WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' 
					AND (
						CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
						OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
					)
					AND IsActive = 1
				)
				BEGIN
					SET @ErrorMsg += ''You are not authorized to update this call.'';               		
				END
			
				IF LEN(@ErrorMsg) > 0
				BEGIN
					SELECT 
						 0 AS stat
						,@ErrorMsg AS stat_msg
						,1001 as stat_code;						  
					RETURN;
				END
		 '
		 SET @SQL1 ='
				IF EXISTS (
					SELECT 1 FROM [' + @DBNAME + '].dbo.[CallLog] WITH(NOLOCK)
					WHERE CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + ' 
					AND (
						CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
						OR EmpId = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+'
					)
					--AND ISNULL(ExternalStatusID, 0) <> 5
					AND IsActive = 1
				)
				BEGIN
					UPDATE cl
					SET  
						cl.EntryDate = CASE WHEN ''' + ISNULL(CONVERT(NVARCHAR(30), @EntryDate, 120), '') + ''' <> '''' THEN ''' + ISNULL(CONVERT(NVARCHAR(30), @EntryDate, 120), '') + ''' 
	        						   ELSE cl.EntryDate END
					   ,cl.AppId = CASE WHEN ' + CONVERT(NVARCHAR(255), ISNULL(@AppId, 0)) + ' <> 0 THEN ' + CONVERT(NVARCHAR(255), ISNULL(@AppId, 0)) + ' 
	        							ELSE cl.AppId END
					   ,cl.Descr = CASE WHEN ''' + REPLACE(LTRIM(RTRIM(ISNULL(@Descr, ''))), '''', '''''') + ''' <> '''' THEN ''' + REPLACE(LTRIM(RTRIM(ISNULL(@Descr, ''))), '''', '''''') + ''' 
								   ELSE cl.Descr END
						,cl.CustomerName = CASE WHEN ''' + REPLACE(LTRIM(RTRIM(ISNULL(@CustomerName, ''))), '''', '''''') + ''' <> '''' THEN ''' + REPLACE(LTRIM(RTRIM(ISNULL(@CustomerName, ''))), '''', '''''') + ''' 
									ELSE cl.CustomerName END
					   ,cl.PriorityID = CASE WHEN ' + CONVERT(NVARCHAR(255), ISNULL(@PriorityId, 0)) + ' <> 0 THEN ' + CONVERT(NVARCHAR(255), ISNULL(@PriorityId, 0)) + ' 
	        							ELSE cl.PriorityID END
					   ,cl.InternalStatusID = CASE WHEN ' + CONVERT(NVARCHAR(255), ISNULL(@StatusId, 0)) + ' <> 0 THEN ' + CONVERT(NVARCHAR(255), ISNULL(@StatusId, 0)) + ' 
											  ELSE cl.InternalStatusID END
					   ,cl.ExternalStatusID = CASE WHEN ' + CONVERT(NVARCHAR(255), ISNULL(@Estatus, 0)) + ' <> 0 THEN ' + CONVERT(NVARCHAR(255), ISNULL(@Estatus, 0)) + ' 
											  ELSE cl.ExternalStatusID END
					   ,cl.ParentId = CASE WHEN ''' + REPLACE(LTRIM(RTRIM(ISNULL(@ParentId, ''))), '''', '''''') + ''' <> '''' THEN ''' + REPLACE(LTRIM(RTRIM(ISNULL(@ParentId, ''))), '''', '''''') + ''' 
									  ELSE cl.ParentId END
					   ,cl.DeptId = CASE WHEN ' + CONVERT(NVARCHAR(255), ISNULL(@DeptId, 0)) + ' <> 0 THEN ' + CONVERT(NVARCHAR(255), ISNULL(@DeptId, 0)) + ' 
									ELSE cl.DeptId END
					   ,cl.EmpId = CASE WHEN ' + CONVERT(NVARCHAR(255), ISNULL(@EmpId, 0)) + ' <> 0 THEN ' + CONVERT(NVARCHAR(255), ISNULL(@EmpId, 0)) + ' 
								   ELSE cl.EmpId END
						,cl.CallTypeId = CASE WHEN ' + CONVERT(NVARCHAR(255), ISNULL(@CallTypeId, 0)) + ' <> 0 THEN ' + CONVERT(NVARCHAR(255), ISNULL(@CallTypeId, 0)) + ' 
									ELSE cl.CallTypeId END
					   ,cl.CallDetails = CASE WHEN ''' + REPLACE(LTRIM(RTRIM(ISNULL(@calldetails, ''))), '''', '''''') + ''' <> '''' THEN ''' + REPLACE(LTRIM(RTRIM(ISNULL(@calldetails, ''))), '''', '''''') + ''' 
										 ELSE cl.CallDetails END
					   ,cl.UpdatedBy = CASE WHEN ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ' <> 0 THEN ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ' 
									   ELSE cl.UpdatedBy END
					   ,cl.ModifiedDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
	       
					FROM [' + @DBNAME + '].dbo.[CallLog] cl WITH(NOLOCK)
					WHERE cl.CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
					AND cl.IsActive = 1 AND ISNULL(cl.ExternalStatusID, 0) <> 5
			'
			SET @SQL2 =' 

					DECLARE @trackingautoIncrement INT = ISNULL((SELECT MAX(LogId) FROM [' + @DBNAME + '].[dbo].[CallLog_tracking]), 0) + 1;

					INSERT INTO ['+@DBNAME+'].dbo.[CallLog_tracking] 
						   (
							LogId
							 ,CallLogId
							 ,EntryDate
							 ,AppId
							 ,Descr
			 	       		 ,PriorityID
			 	       		 ,InternalStatusID
			 	       		 ,ExternalStatusID
							 ,ParentId
							 ,DeptId
							 ,EmpId                    
							 ,CallDetails
							 ,CreatedBy
							 ,CreatedDate
						   )
					VALUES (
							@trackingautoIncrement
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
							 ,''' + ISNULL(CONVERT(NVARCHAR(30), @EntryDate, 120), '') + '''
							 ,' + CONVERT(NVARCHAR(MAX), ISNULL(@AppId, 0)) + '
							 ,''' + REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Descr)), '')), '''', '''''') + '''
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@PriorityId, 0)) + '
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@StatusId, 0)) + '
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@Estatus, 0)) + '
							 ,''' + REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@ParentId)), '')), '''', '''''') + '''
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@DeptId, 0)) + '
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@EmpId, 0)) + '                                                                            
							 ,''' + REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@calldetails)), '')), '''', '''''') + '''
							 ,' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
							 ,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						  )
						  '
				SET @SQL3 ='
					SELECT DISTINCT TOP 1
						c.CallLogId sr
						,c.EntryDate date
						,u.customercode company
						,c.CustomerName callBy
						,ISNULL(A.appname,'''') appname
						,ISNULL(c.Descr,'''') description
						,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
							ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
								CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
								ISNULL(e1.lastname, '''')
							)) 
						END AS receivedBy
						,FORMAT(c.CreatedDate, ''HH:mm'') AS time
						,ISNULL(md1.Designationname,'''')  AS DeptName
						,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
						CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
						END AS AssignedEmpName
						,ISNULL(s1.Name,'''') AS status
						,ISNULL(s2.Name,'''') AS Estatus				
						,ISNULL(c.Feedback,'''') AS feedback
						,ISNULL(c.RatingByCustomer,0) AS rating
						,c.Source topicRaisedBy
						,ISNULL(p.Name,'''') AS priority
						,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
						,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed
						,ISNULL(
						CONVERT(VARCHAR(8), 
						DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
							ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
							ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
							ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
						), ''00:00:00''), 108)
						,'''') AS CallDuration
						,ISNULL(c.CallDetails,'''') AS callDetails
						,ISNULL(t.TicketNo, '''') AS ticket
						,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
						,ISNULL(c.ParentId,'''') parentId
						,ISNULL(cct.TypeName, '''') AS CallType
					 FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)						
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			  			  ON c.ProjectID = u.id
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 			  ON c.AppId = A.AppId
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 			  ON c.InternalStatusID = s1.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 			  ON c.ExternalStatusID = s2.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 			  ON c.Priorityid = p.Priorityid
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_CallType] cct WITH(NOLOCK)
						  ON cct.Id = c.CallTypeId
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 			  ON c.CallLogId = t.CallLogId			
					 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 			  ON md1.id = c.DeptId
					 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
			 			  ON c.EmpId = e.id
					 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 			  ON c.createdby = e1.id		
					 WHERE c.IsActive = 1 AND c.CalllogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'
					GROUP BY 
						  c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
						  c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
						  s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
						  c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
						  t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
						  c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname, cct.TypeName
				END
				ELSE
				BEGIN
					SELECT 
						  0 AS stat 
						 ,''CallLogId does not exist'' AS stat_msg 
						 ,1001 AS stat_code;
				END'

		   PRINT(@SQL)
		   PRINT(@SQL1)
		   PRINT(@SQL2)
		   PRINT(@SQL3)
		   EXEC(@SQL
			  + @SQL1
			  + @SQL2
			  + @SQL3
			   )
	END
	ELSE IF(ISNULL(@mode,'')='FEEDBACK')   
	BEGIN 
			SET @SQL1 ='
					-- IF EXISTS(SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND (CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
					--              OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ') AND IsActive = 1)
					IF EXISTS(SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+')
					BEGIN
						 UPDATE c					
						 SET 
			    			 c.Feedback         = '''+REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Feedback)), '')), '''', '''''')+'''
			    			,c.RatingByCustomer =   '+CONVERT(NVARCHAR(255),ISNULL(@RatingByCustomer,0))+'
							,c.UpdatedBy		=   '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+'
							,c.ModifiedDate		= ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
							,c.RatingDateTime   = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
			    		 FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)
						 WHERE c.CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND c.IsActive = 1
			    
						DECLARE @trackingautoIncrement INT = ISNULL((SELECT MAX(LogId) FROM [' + @DBNAME + '].[dbo].[CallLog_tracking]), 0) + 1;

						 INSERT INTO ['+@DBNAME+'].dbo.[CallLog_tracking] 
								(
								  LogId
								  ,CallLogId                           
								  ,Feedback
								  ,RatingByCustomer                             
								  ,CreatedBy
								  ,CreatedDate
								)
						 VALUES (
					 			  @trackingautoIncrement
								  ,' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '                           
								  ,''' + REPLACE(CONVERT(NVARCHAR(255), ISNULL(RTRIM(LTRIM(@Feedback)), '')), '''', '''''') + '''
								  ,' + CONVERT(NVARCHAR(255), ISNULL(@RatingByCustomer, 0)) + '                             
								  ,' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
								  ,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
								);

						 SELECT 
			    			 1 AS stat 
							 ,''The rating has been updated successfully.'' AS stat_msg 
							 ,1000 AS stat_code;
					END
					ELSE
					BEGIN
			    		 SELECT 
			    			  0 AS stat
			    			--  ,''CallLogId deleted.'' AS stat_msg
							 ,''CallLogId does not exists.'' AS stat_msg
			    			 ,1001 AS stat_code;
					END'

			-- PRINT (@SQL)
			PRINT (@SQL1)
			EXEC(@SQL1)

	END
	ELSE IF(ISNULL(@mode,'')='COMMENTS')
	BEGIN
			SET @SQL = '
				DECLARE @ErrorMsg NVARCHAR(200) = '''',
						@InsertedId INT = 0,
						@CallLogid INT = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+',
						@Comments NVARCHAR(max) = '''+REPLACE(CONVERT(NVARCHAR(max), ISNULL(RTRIM(LTRIM(@Comments)),'')), '''', '''''')+''',
						@FilePath NVARCHAR(max) = '''+CONVERT(NVARCHAR(Max),ISNULL(RTRIM(LTRIM(@FilePath)),''''))+''',
						@CreatedBy INT = '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+',
						@IsClient INT = '+CONVERT(NVARCHAR(255),ISNULL(@IsClient,0))+',
						@CorpId INT = 0,
						@CreatedByName NVARCHAR(200);

				IF NOT EXISTS (
					SELECT 1 
					FROM  ['+@DBNAME+'].[dbo].[CallLog] WITH(NOLOCK)
					WHERE CallLogId = @CallLogid
					AND IsActive = 1
				)	
				BEGIN
					SET @ErrorMsg += ''CallLogId does not exists. '';
				END

				IF LEN(@ErrorMsg) > 0
				BEGIN
					SELECT 
						 0 AS stat
						,@ErrorMsg AS stat_msg
						,1001 as stat_code;						  
					RETURN;
				END

				IF EXISTS(
					SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) 
					WHERE CallLogId = @CallLogid
					AND IsActive = 1
				)
				BEGIN
					
					IF(@IsClient <> 0)
					BEGIN
						SELECT
							@CorpId  = cc.Id
							,@CreatedByName = LTRIM(RTRIM(
								ISNULL(cc.firstname, '''') + '' '' + ISNULL(cc.lastname, '''')
							))
						FROM ['+ @DBNAME +'].[dbo].[corp_cust] AS cc WITH(NOLOCK)
						WHERE cc.id = @CreatedBy;
					END
					ELSE
					BEGIN
						SELECT
							@CreatedByName = LTRIM(RTRIM(
								ISNULL(CU.firstname, '''') + '' '' +
								CASE WHEN ISNULL(CU.middlename, '''') <> '''' THEN CU.middlename + '' '' ELSE '''' END +
								ISNULL(CU.lastname, '''')
							))
						FROM ['+ @DBNAME +'].[dbo].[Usermanagement_systemloginmaster] AS CU WITH(NOLOCK)
						WHERE CU.id = @CreatedBy;
					END

					INSERT INTO ['+@DBNAME+'].dbo.[CallLog_Comments]  ( 
						CallLogId, Comments, Filepath, CreatedBy, CreatedDate, IsClient
					) VALUES ( 
						@CallLogid
						,@Comments
						,@FilePath
						,@CreatedBy
						,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
						,@IsClient
					)

					SET  @InsertedId  = SCOPE_IDENTITY();

					DECLARE @onesignal_SubPlayid NVARCHAR(MAX),
							@Onesignal_Appid NVARCHAR(255),
							@Onesignal_RestApiKey NVARCHAR(255),
							@TicketCreatedBy INT,
							@ProjectId INT,
							@ProjectCode NVARCHAR(MAX),
							@CreatedByCode NVARCHAR(255),
							@Descr nvarchar(255),
							@NotificationContent NVARCHAR(MAX),
							@AppRegId_Internal INT;

					SELECT 
						@ProjectId = ISNULL(clo.ProjectID, 0)
						,@ProjectCode = ISNULL(clo.ProjectCode, '''')
						,@CreatedByCode = ISNULL(clo.CreatedByCode, '''')
						,@Descr = ISNULL(clo.Descr, '''')
					 FROM ['+@DBNAME+'].[dbo].[CallLog] clo WITH(NOLOCK)
					 WHERE clo.CallLogId = @CallLogid;

					SET @NotificationContent = ''A new comment has been added to your call #''+ @Descr +'' by '' + ISNULL(@CreatedByName, ''Support Agent'') + ''.'';

					INSERT INTO ['+@DBNAME+'].[dbo].[CSystem_Notification](
						CompanyCode, CompanyId, FromUserId, Title, Message, Module, EntryDate
					) values (
						@ProjectCode, @ProjectId, @CreatedBy, ''New Comment'', @NotificationContent, ''call'', ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
					);

					SELECT @AppRegId_Internal = appid FROM [404146_CentralUser].[dbo].[Appmanagement_AppMaster] WITH(NOLOCK) WHERE appname = ''Optigo Carely'';
					SELECT 
						@Onesignal_Appid = Onesignal_Appid, 
						@Onesignal_RestApiKey = Onesignal_RestApiKey
					FROM [404146_CentralUser].[dbo].[Onesignal_AppDetail] WITH(NOLOCK)
					WHERE Onesignal_AppName = ''Optigo Carely'';
				';
				PRINT(@SQL)
				SET @SQL1 = '
					SELECT @onesignal_SubPlayid = ''['' + STRING_AGG(''"'' + osl.onesignal_SubPlayid + ''"'', '','') + '']''
					FROM [404146_CentralUser].[dbo].[onesignallist] AS osl WITH(NOLOCK)
					INNER JOIN [404146_CentralUser].[dbo].[Appmanagement_Device] AS Ad WITH(NOLOCK)
						  ON Ad.SystemLoginId = osl.SystemLoginid AND Ad.DeviceId = osl.deviceid
					WHERE osl.SystemLoginid IN (SELECT id FROM ['+@DBNAME+'].dbo.[corp_cust] WHERE custid = @ProjectId)
					  AND Ad.AppId = @AppRegId_Internal
					  AND Ad.IsEnable = 1
					  AND osl.dbname = @CreatedByCode
					  AND osl.SystemLoginId <> @CorpId;

					SELECT
						1 AS stat 
						,''The comments are inserted successfully.'' AS stat_msg
						,1000 AS stat_code
						,@onesignal_SubPlayid AS Onesignal_SubPlayid
						,@Onesignal_Appid AS Onesignal_Appid
						,@Onesignal_RestApiKey AS Onesignal_RestApiKey
						,''call'' AS Module
						,@CallLogid AS CallLogid
						,''New Comment'' AS Heading
						,@NotificationContent AS Content;

					SELECT
						cc1.Id AS id
						, cc1.CallLogId
						, ISNULL(cc1.Comments, '''') AS Comments
						, ISNULL(cc1.FilePath, '''') AS FilePath
						, cc1.CreatedDate AS CreatedDate
						,cc1.CreatedBy AS CreatedBy
						,CASE 
							WHEN ISNULL(cc1.IsClient, 0) = 1 THEN
								LTRIM(RTRIM(
									ISNULL(coc.firstname, '''') + '' '' +
									ISNULL(coc.lastname, '''')
								))
							WHEN ISNULL(cc1.CreatedBy, 0) = 0 THEN ''''
							ELSE
							LTRIM(RTRIM(
								ISNULL(e.firstname, '''') + '' '' +
									CASE 
										WHEN ISNULL(e.middlename, '''') <> '''' 
											THEN e.middlename + '' '' 
										ELSE '''' 
									END +
										ISNULL(e.lastname, '''')
								))
							END AS Name
						,ISNULL(cc1.IsClient, 0) AS IsClient
					FROM [' + @DBNAME + '].[dbo].[CallLog_Comments] cc1 WITH (NOLOCK)
					LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] e WITH (NOLOCK)
						ON cc1.CreatedBy = e.id
						 AND ISNULL(cc1.IsClient, 0) = 0
					LEFT JOIN  [' + @DBNAME + '].dbo.[corp_cust] coc WITH(NOLOCK)
						ON cc1.CreatedBy = coc.id
						AND ISNULL(cc1.IsClient, 0) = 1
					WHERE cc1.Id = @InsertedId
					AND cc1.CallLogId = @CallLogid

				END
				ELSE 
				BEGIN
					SELECT 
						 0 AS stat 
						,''The calllog_id is deleted.'' AS stat_msg 
						,1001 AS stat_code;
				END'

			PRINT(@SQL1)
			EXEC(@SQL+@SQL1)
	END
	ELSE IF(ISNULL(@mode,'')= 'EDIT_COMMENTS')
	BEGIN
		SET @SQL = '
				DECLARE @CallLogid INT = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+',
						@CommentId INT = '+CONVERT(NVARCHAR(255),ISNULL(@CommentId,0))+',
						@Comments NVARCHAR(max) = '''+REPLACE(CONVERT(NVARCHAR(max), ISNULL(RTRIM(LTRIM(@Comments)),'')), '''', '''''')+''',
						@FilePath NVARCHAR(max) = '''+CONVERT(NVARCHAR(Max),ISNULL(RTRIM(LTRIM(@FilePath)),''''))+''',
						@UpdatedBy INT = '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+',
						@IsAdmin INT = 0;
				
				SELECT 
					@IsAdmin = IIF(ISNULL(usl.mastermanagement_roleid, 0) = 3 AND ISNULL(usl.designation, '''') = ''admin'', 1, 0)
				FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] as usl WITH(NOLOCK)
				WHERE usl.id = @UpdatedBy;

				IF EXISTS (
					SELECT 1 
					FROM  ['+@DBNAME+'].[dbo].[CallLog_Comments] as cco WITH(NOLOCK)
					WHERE cco.Id = @CommentId
					AND cco.CallLogId = @CallLogid
					AND (
						@IsAdmin = 1
						OR cco.CreatedBy = @UpdatedBy
					)
				)
				BEGIN
					UPDATE ccs
						SET ccs.Comments = @Comments
						,ccs.FilePath = CASE
											WHEN ISNULL(@FilePath, '''') <> ''''
												THEN @FilePath
											ELSE ''''
									   END
						,ccs.UpdatedBy = @UpdatedBy
						,ccs.UpdatedDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
					FROM  ['+@DBNAME+'].[dbo].[CallLog_Comments] as ccs WITH(NOLOCK)
					WHERE ccs.Id = @CommentId
					AND ccs.CallLogId = @CallLogid

					SELECT 
						1 AS stat 
						,''Comment edited successfully'' AS stat_msg
						,1000 AS stat_code;

					SELECT
						cc1.Id AS id
						, cc1.CallLogId
						, ISNULL(cc1.Comments, '''') AS Comments
						, ISNULL(cc1.FilePath, '''') AS FilePath
						, cc1.CreatedDate AS CreatedDate
						,cc1.CreatedBy AS CreatedBy
						,CASE 
							WHEN ISNULL(cc1.IsClient, 0) = 1 THEN
								LTRIM(RTRIM(
									ISNULL(coc.firstname, '''') + '' '' +
									ISNULL(coc.lastname, '''')
								))
							WHEN ISNULL(cc1.CreatedBy, 0) = 0 THEN ''''
							ELSE
							LTRIM(RTRIM(
								ISNULL(e.firstname, '''') + '' '' +
									CASE 
										WHEN ISNULL(e.middlename, '''') <> '''' 
											THEN e.middlename + '' '' 
										ELSE '''' 
									END +
										ISNULL(e.lastname, '''')
								))
							END AS Name
						,ISNULL(cc1.IsClient, 0) AS IsClient
					FROM [' + @DBNAME + '].[dbo].[CallLog_Comments] cc1 WITH (NOLOCK)
					LEFT JOIN [' + @DBNAME + '].[dbo].[Usermanagement_systemloginmaster] e WITH (NOLOCK)
						ON cc1.CreatedBy = e.id
						 AND ISNULL(cc1.IsClient, 0) = 0
					LEFT JOIN  [' + @DBNAME + '].dbo.[corp_cust] coc WITH(NOLOCK)
						ON cc1.CreatedBy = coc.id
						AND ISNULL(cc1.IsClient, 0) = 1
					WHERE cc1.Id = @CommentId
					AND cc1.CallLogId = @CallLogid

				END
				ELSE
				BEGIN
					SELECT 
						0 AS stat 
						,''Comment not found'' AS stat_msg 
						,1001 AS stat_code;
				END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF(ISNULL(@mode,'')= 'DELETE_COMMENTS')
	BEGIN
		SET @SQL = '
			DECLARE @CallLogid INT = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+',
					@CommentId INT = '+CONVERT(NVARCHAR(255),ISNULL(@CommentId,0))+',
					@CreatedBy INT = '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+',
					@IsAdmin INT = 0;
			
			SELECT 
				@IsAdmin = IIF(ISNULL(usl.mastermanagement_roleid, 0) = 3 AND ISNULL(usl.designation, '''') = ''admin'', 1, 0)
			FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] as usl WITH(NOLOCK)
			WHERE usl.id = @CreatedBy;

			IF EXISTS (
				SELECT 1 
				FROM  ['+@DBNAME+'].[dbo].[CallLog_Comments] as cco WITH(NOLOCK)
				WHERE cco.Id = @CommentId
				AND cco.CallLogId = @CallLogid
				AND (
					@IsAdmin = 1
					OR cco.CreatedBy = @CreatedBy
				)
			)
			BEGIN
				
				DELETE FROM ['+@DBNAME+'].[dbo].[CallLog_Comments]
				WHERE Id = @CommentId
				AND CallLogId = @CallLogid
				AND (
					@IsAdmin = 0
					OR CreatedBy = @CreatedBy
				)

				SELECT 
					1 AS stat 
					,''Comment deleted successfully'' AS stat_msg
					,1000 AS stat_code;

				SELECT
					@CallLogid as CallLogid
					,@CommentId as CommentId

			END
			ELSE
			BEGIN
				SELECT 
					0 AS stat 
					,''Comment not found'' AS stat_msg 
					,1001 AS stat_code;
			END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF(ISNULL(@mode,'')= 'IS')
	BEGIN
		  SET @SQL = '
				 DECLARE @ErrorMsg NVARCHAR(200) = '''',
						@IsAdmin INT = 0;

					SELECT 
						@IsAdmin = IIF(ISNULL(usl.mastermanagement_roleid, 0) = 3 AND ISNULL(usl.designation, '''') = ''admin'', 1, 0)
					FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] as usl WITH(NOLOCK)
					WHERE usl.id = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+';

				   IF NOT EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND IsActive = 1)	
				   BEGIN
					   SET @ErrorMsg += ''CallLogId does not exists. '';
				   END
				   ELSE IF @IsAdmin <> 1 AND NOT EXISTS (
						SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] WITH(NOLOCK)
						WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' 
						AND (
							CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
							OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
						)
						AND IsActive = 1
					)
					BEGIN
						SET @ErrorMsg += ''You do not have permission to change the Internal Status.'';
					END

				   IF LEN(@ErrorMsg) > 0
				   BEGIN
					   SELECT
							 0 AS stat
							,@ErrorMsg AS stat_msg
							,1001 as stat_code;
					   RETURN;
				   END

				--IF EXISTS(SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND ISNULL(ExternalStatusID,0) <> 5 AND (CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
				--				 OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ') AND IsActive = 1 )
				--BEGIN 
					  UPDATE cl
					  SET 
							cl.InternalStatusID = '+CONVERT(NVARCHAR(255),ISNULL(@StatusId,0))+'
						   ,cl.UpdatedBy		= '+ CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+'
						   ,cl.ModifiedDate     = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
					  FROM ['+@DBNAME+'].dbo.[CallLog] cl WITH(NOLOCK)
					  WHERE cl.CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' 
					  AND ISNULL(cl.ExternalStatusID,0) <> 5  AND cl.IsActive = 1;
			'; 
		   SET @SQL1 ='
					DECLARE @trackingautoIncrement INT = ISNULL((SELECT MAX(LogId) FROM [' + @DBNAME + '].[dbo].[CallLog_tracking]), 0) + 1;

					  INSERT INTO [' + @DBNAME + '].dbo.[CallLog_tracking] 
							 (
								LogId
							   ,CallLogId
							   ,InternalStatusID
							   ,CreatedBy
							   ,CreatedDate
							 )
					  VALUES (
				  				@trackingautoIncrement
							   ,' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '              
							   ,' + CONVERT(NVARCHAR(255), ISNULL(@StatusId, 0)) + '               
							   ,' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
							   ,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
							 );

						SELECT 
				      		1 AS stat 
							,''The Internal status is updated.'' AS stat_msg 
							,1000 AS stat_code;
				--END
				--ELSE 
				--BEGIN
				--		SELECT 
				--			0 AS stat
				--		   ,''The internal status cannot be changes because the external status is closed.'' AS stat_msg
				--		   ,1001 AS stat_code;
				--END
			'

			PRINT(@SQL)
			PRINT(@SQL1)
			EXEC(@SQL
			   + @SQL1
				)

	END
	ELSE IF(ISNULL(@mode,'')= 'ES')
	BEGIN
		SET @SQL = '
				
					DECLARE @ErrorMsg NVARCHAR(200) = '''',
						   @ProjectId INT, 
						   @ResolvedProjectCode NVARCHAR(MAX),
						   @CreatedByCode NVARCHAR(255), 
						   @ExternalStatusName NVARCHAR(MAX),
						   @IsAdmin INT = 0;

					SELECT 
						@IsAdmin = IIF(ISNULL(usl.mastermanagement_roleid, 0) = 3 AND ISNULL(usl.designation, '''') = ''admin'', 1, 0)
					FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] as usl WITH(NOLOCK)
					WHERE usl.id = @CreatedBy;

					IF NOT EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] WHERE CallLogId = @CallLogId AND IsActive = 1)	
					BEGIN
					   SET @ErrorMsg += ''CallLogId does not exists.'';
					END
					ELSE           
					IF @IsAdmin <> 1 AND NOT EXISTS (
						SELECT 1 
						FROM  ['+@DBNAME+'].[dbo].[CallLog] WITH(NOLOCK)
						WHERE CallLogId = @CallLogId 
						AND (
							CreatedBy = @CreatedBy 
							OR EmpId = @CreatedBy 
						) 
						AND IsActive = 1
					)
					BEGIN
					   SET @ErrorMsg += ''You do not have permission to change the External Status.'';               		
					END

				   IF LEN(@ErrorMsg) > 0
				   BEGIN
					   SELECT 
							 0 AS stat
							,@ErrorMsg AS stat_msg
							,1001 as stat_code;						  
					   RETURN;
				   END

				   -- Step 1: Get details from CallLog
				   SELECT 
						@ProjectId = ISNULL(ProjectID, 0)
						,@ResolvedProjectCode = ISNULL(ProjectCode, '''')
						,@CreatedByCode = ISNULL(CreatedByCode, '''')
				   FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK)
				   WHERE CallLogId = @CallLogId;

				   SELECT @ExternalStatusName = Name FROM ['+@DBNAME+'].dbo.[CallLog_status] WITH(NOLOCK) WHERE StatusID = @Estatus;
			'
			SET @SQL1 = '
				  --IF EXISTS (SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = @CallLogId AND (CreatedBy = @CreatedBy OR EmpId = @CreatedBy ) AND IsActive = 1 )
				  --BEGIN
					  UPDATE cl
					  SET 
						   cl.ExternalStatusID = CASE WHEN @Estatus <> 0 THEN @Estatus ELSE cl.ExternalStatusID END
						  ,cl.PriorityID       = CASE WHEN @PriorityId <> 0 THEN @PriorityId ELSE cl.PriorityID END
						  ,cl.UpdatedBy        = @CreatedBy
						  ,cl.ModifiedDate     = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
					  FROM [' + @DBNAME + '].dbo.[CallLog] cl WITH(NOLOCK)
					  WHERE cl.CallLogId = @CallLogId;
                      
					  DECLARE @trackingautoIncrement INT = ISNULL((SELECT MAX(LogId) FROM [' + @DBNAME + '].[dbo].[CallLog_tracking]), 0) + 1;

					  INSERT INTO ['+@DBNAME+'].dbo.[CallLog_tracking] 
							 (
								LogId
							   , CallLogId               
							   , ExternalStatusID                  
							   , PriorityID             
							   , CreatedBy
							   , CreatedDate
							 )
					  VALUES (
								@trackingautoIncrement
							   , @CallLogId                
							   , @Estatus
							   , @PriorityId
							   , @CreatedBy
							   , ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						);
			'
			SET @SQL2 = '
					  DECLARE @onesignal_SubPlayid NVARCHAR(MAX),
							  @Onesignal_Appid NVARCHAR(255),
							  @Onesignal_RestApiKey NVARCHAR(255),
							  @NotificationContent NVARCHAR(MAX),
							  @AppRegId_Internal INT;

					  SET @NotificationContent = ''The status of your request #'' + CAST(@CallLogId AS NVARCHAR(MAX)) + '' has been updated to '' + ISNULL(@ExternalStatusName, ''Updated Status'') + ''.'';

					  INSERT INTO ['+@DBNAME+'].[dbo].[CSystem_Notification](
						CompanyCode, CompanyId, FromUserId, Title, Message, Module, EntryDate
					  ) values (
						@ResolvedProjectCode, @ProjectId, @CreatedBy, ''Status Updated'', @NotificationContent, ''call'', ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
					  );

					  SELECT @AppRegId_Internal = appid FROM [404146_CentralUser].[dbo].[Appmanagement_AppMaster] WITH(NOLOCK) WHERE appname = ''Optigo Carely'';

					  SELECT @Onesignal_Appid = Onesignal_Appid, @Onesignal_RestApiKey = Onesignal_RestApiKey
					  FROM [404146_CentralUser].[dbo].[Onesignal_AppDetail] WITH(NOLOCK)
					  WHERE Onesignal_AppName = ''Optigo Carely'';

					  SELECT @onesignal_SubPlayid = ''['' + STRING_AGG(''"'' + osl.onesignal_SubPlayid + ''"'', '','') + '']''
					  FROM [404146_CentralUser].[dbo].[onesignallist] AS osl WITH(NOLOCK)
					  INNER JOIN [404146_CentralUser].[dbo].[Appmanagement_Device] AS Ad WITH(NOLOCK)
						  ON Ad.SystemLoginId = osl.SystemLoginid AND Ad.DeviceId = osl.deviceid
					  WHERE osl.SystemLoginid IN (SELECT id FROM [' + @DBNAME + '].dbo.[corp_cust] WHERE custid = @ProjectId)
					  AND Ad.AppId = @AppRegId_Internal
					  AND Ad.IsEnable = 1
					  AND osl.dbname = @CreatedByCode;
			'

			SET @SQL3 = '
					  SELECT 
						   1 AS stat
						  ,''The External status or Priority is updated.'' AS stat_msg
						  ,1000 AS stat_code
						  ,@onesignal_SubPlayid AS Onesignal_SubPlayid
						  ,@Onesignal_Appid AS Onesignal_Appid
						  ,@Onesignal_RestApiKey AS Onesignal_RestApiKey
						  ,''call'' AS Module
						  ,@CallLogId AS CallLogid
						  ,''Status Updated'' AS Heading
						  ,@NotificationContent AS Content;

						SELECT
							@CallLogId AS CallLogId
							,@Estatus AS Estatus
							,@CreatedBy AS UpdatedBy
							,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE()) AS ModifiedDate
				  --END
				  --ELSE
				  --BEGIN
					 -- SELECT 
						--   0 AS stat
						--  ,''The calllog_id does not exist.'' AS stat_msg
						--  ,1001 AS stat_code;
				  --END
				  '
			
				  DECLARE @SQL_TOTAL NVARCHAR(MAX) = @SQL + @SQL1 + @SQL2 + @SQL3;
				  PRINT(@SQL)
				  PRINT(@SQL1)
				  PRINT(@SQL2)
				  PRINT(@SQL3)


		EXEC SP_EXECUTESQL 
			@SQL_TOTAL,
			N'@CallLogId INT, @Estatus INT, @PriorityId INT, @CreatedBy INT',
			@CallLogId = @CallLogid,
			@Estatus = @Estatus,
			@PriorityId = @PriorityId,
			@CreatedBy = @CreatedBy;
    
	END
	ELSE IF(ISNULL(@mode,'')= 'FORWARDED')
	BEGIN
		  SET @SQL = '
				   DECLARE @ErrorMsg NVARCHAR(200) = ''''
				   IF NOT EXISTS (SELECT 1 FROM  ['+@DBNAME+'].[dbo].[CallLog] WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+' AND IsActive = 1)	
				   BEGIN
					   SET @ErrorMsg += ''CallLogId does not exists. '';
				   END

				   IF LEN(@ErrorMsg) > 0
				   BEGIN
					   SELECT 
							 0 AS stat
							,@ErrorMsg AS stat_msg
							,1001 as stat_code;
					   RETURN;
				   END'

		   SET @SQL1 = '
				  IF EXISTS (SELECT 1 FROM ['+@DBNAME+'].dbo.[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+' AND ISNULL(ExternalStatusID,0) <> 5 AND (CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+' 
								 OR EmpId = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + ') AND IsActive = 1)
				  BEGIN
					   UPDATE c
					   SET 
							c.DeptId = '+CONVERT(NVARCHAR(255), ISNULL(@DeptId, 0))+'
						   ,c.EmpId = '+CONVERT(NVARCHAR(255), ISNULL(@EmpId, 0))+'
						   ,c.UpdatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+'
						   ,c.ModifiedDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
					   FROM ['+@DBNAME+'].[dbo].[CallLog] c WITH(NOLOCK)
					   WHERE c.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+' 
					   AND c.IsActive = 1;
              		
						INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] (
							CallLogId, CallStart, CallClosed, CallDuration, CreatedBy, CreatedDate,
							ReceivedBy, InternalStatus, Description, ForwardedEmpId, IsForwardFollowup, ResonId
					   ) SELECT
							cii.CallLogId,
							cii.StartDate,
							cii.EndDate,
							DATEDIFF(SECOND, cii.StartDate, cii.EndDate)
							-
							ISNULL(
								(
									SELECT SUM(
										DATEDIFF(
											SECOND,
											cp.PauseStart,
											ISNULL(cp.PauseEnd, ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE()))
										)
									)
									FROM [' + @DBNAME + '].dbo.[CallLog_PauseLog] cp WITH(NOLOCK)
									WHERE cp.CallLogId = cii.CallLogId
								), 0
							) AS CallDuration,
							cii.CreatedBy,
							cii.CreatedDate,
							cii.CreatedBy,
							cii.InternalStatusID,
							cii.Descr,
							cii.EmpId,
							1,
							'+CONVERT(NVARCHAR(255), ISNULL(@ResonId, 0))+'
						FROM ['+@DBNAME+'].[dbo].[CallLog] cii WITH(NOLOCK) 
						WHERE cii.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+' 

						IF EXISTS (
							SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_PauseLog] WITH(NOLOCK)
							WHERE CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'
						)
						BEGIN
							INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_FollowUp_PauseLog] (
								FollowId, PauseStart, PauseEnd
							) SELECT 
								SCOPE_IDENTITY() AS FollowId,
								PauseStart,
								PauseEnd
							FROM ['+@DBNAME+'].[dbo].[CallLog_PauseLog] WITH(NOLOCK)
							WHERE CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+';
						END
						
						UPDATE cii1
							SET cii1.StartDate = NULL
							,cii1.EndDate = NULL
							,cii1.TotalPausedtime = NULL
							,cii1.CreatedBy = '+CONVERT(NVARCHAR(255), ISNULL(@EmpId, 0))+'
						FROM ['+@DBNAME+'].[dbo].[CallLog] cii1 WITH(NOLOCK)
						WHERE cii1.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+';

					   DECLARE @trackingautoIncrement INT = ISNULL((SELECT MAX(LogId) FROM [' + @DBNAME + '].[dbo].[CallLog_tracking]), 0) + 1;

					   INSERT INTO ['+@DBNAME+'].dbo.[CallLog_tracking] 
							  (
								LogId
							   ,CallLogId
							   ,DeptId
							   ,EmpId						
							   ,CreatedBy
							   ,CreatedDate
							  )
					   VALUES (
				   				@trackingautoIncrement
							   ,'+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'
							   ,'+CONVERT(NVARCHAR(255), ISNULL(@DeptId, 0))+'
							   ,'+CONVERT(NVARCHAR(255), ISNULL(@EmpId, 0))+'
							   ,'+CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0))+'
							   ,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
					   );
              
					  SELECT 
							1 AS stat
						  ,''Ticket Assigned to employee'' AS stat_msg
						  ,1000 AS stat_code;'

			  SET @SQL2 ='    
				SELECT DISTINCT TOP 1
					 c.CallLogId sr
					,c.EntryDate date
					,u.customercode company
					,c.CustomerName callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr,'''') description
					,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
						  ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname,'''')  AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name,'''') AS status
					,ISNULL(s2.Name,'''') AS Estatus				
					,ISNULL(c.Feedback,'''') AS feedback
					,ISNULL(c.RatingByCustomer,0) AS rating
					,c.Source topicRaisedBy
					,ISNULL(p.Name,'''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed			  
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
						), ''00:00:00''), 108),
					'''') AS CallDuration
					,ISNULL(c.CallDetails,'''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
					,ISNULL(c.ParentId,'''') AS parentId
				'
		SET @SQL3 ='
				 FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)						
				 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			 		  ON c.ProjectID = u.id
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 		  ON c.AppId = A.AppId
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 		  ON c.InternalStatusID = s1.StatusID
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 		  ON c.ExternalStatusID = s2.StatusID
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 		  ON c.Priorityid = p.Priorityid			
				 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 		  ON c.CallLogId = t.CallLogId			
				 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 		  ON md1.id = c.DeptId
				 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
			 		  ON c.EmpId = e.id
				 LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 		  ON c.createdby = e1.id		
				 WHERE c.IsActive = 1 AND c.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'
            
				GROUP BY 
						  c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
						  c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
						  s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
						  c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
						  t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
						  c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname			
				END
				ELSE
				BEGIN
					  SELECT 
							0 AS stat
						  ,''This call cannot be forwarded because the external status is closed.'' AS stat_msg
						  ,1001 AS stat_code;
				END;'

			PRINT (@SQL)
			PRINT(@SQL1)
			PRINT(@SQL2)
			PRINT(@SQL3);
        
        
			EXEC ( @SQL
				 + @SQL1
				 + @SQL2
				 + @SQL3
				 );
        			
	END 
	ELSE IF(ISNULL(@mode,'')='ADDREVIEW')
	BEGIN
			DROP TABLE IF EXISTS #deptIssue
			CREATE  TABLE #deptIssue(DeptId INT, IssueId INT);

			INSERT INTO #deptIssue (DeptId, IssueId)
			SELECT 
				d.DeptId,
				CAST(issues.VALUE AS INT) AS IssueId
			FROM OPENJSON(@p, '$.departments') 
			WITH (
				DeptId INT,
				issues NVARCHAR(MAX) AS JSON
			) AS d
			CROSS APPLY OPENJSON(d.issues) AS issues;
	SET @SQL ='

		 IF EXISTS (SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog] WITH(NOLOCK) WHERE CallLogId = '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+'  AND IsActive = 1 )
		 BEGIN
			INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Review_Form]           
				  (
				   CallLogId
				   ,DeptId
				   ,IssueId
				   ,Satisfaction
				   ,Comments
				   ,CreatedBy
				  )
			SELECT 
				  '+CONVERT(NVARCHAR(255),ISNULL(@CallLogid,0))+'
				  ,DeptId
				  ,IssueId
				  ,'''+CONVERT(NVARCHAR(255),ISNULL(RTRIM(LTRIM(@Satisfaction)),0))+'''
				  ,'''+REPLACE(CONVERT(NVARCHAR(max), ISNULL(RTRIM(LTRIM(@Comments)),'')), '''', '''''')+'''
				  ,  '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+'
			FROM 
				  #deptIssue;
	   
				 SELECT 
					  1 AS stat 
					 ,''The review form has been submitted successfully.'' AS stat_msg 
					 ,1000 AS stat_code;
					
			END 
			ELSE
			BEGIN		      
				 SELECT 
					  0 AS stat 
					 ,''The calllogId does not exists.'' AS stat_msg 
					 ,1001 AS stat_code;
			END'

			PRINT(@SQL)
			EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode,'')='DELETE')
	BEGIN
			DROP TABLE IF EXISTS #DeleteIdsTbl
			CREATE TABLE #DeleteIdsTbl  (CallLogId INT)

			INSERT INTO #DeleteIdsTbl (CallLogId)
			SELECT value
			FROM OPENJSON(@p, '$.DeleteIds')    

			SET @SQL = '
				Update c				  
				SET   c.IsActive     = 0
					 ,c.UpdatedBy    = '+CONVERT(NVARCHAR(255),ISNULL(@CreatedBy,0))+'
					 ,c.ModifiedDate = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
				 FROM ['+@DBNAME+'].[dbo].[CallLog] c WITH(NOLOCK)
				 WHERE c.CallLogId IN (SELECT CallLogId FROM #DeleteIdsTbl)

				 SELECT 
					   1 AS stat 
					  ,''Selected  CallLogIds Deleted FROM table.'' AS stat_msg 
					  ,1000 AS stat_code;
			'	  
			PRINT(@SQL)
			EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode,'')='dashboard')
	BEGIN
		SET @SQL = '
			DECLARE 
				@_custid int
				,@_custcode varchar(50)
				,@count_of_call int
				,@count_of_ticket int
				,@count_of_order int
				,@count_of_training int;

			SELECT
				@_custid = ISNULL(cc.custid, 0)
				,@_custcode = ISNULL(us.customercode, '''')
			FROM ['+@DBNAME+'].[dbo].[corp_cust] AS cc  WITH(NOLOCK)
			LEFT JOIN ['+@DBNAME+'].[dbo].[Usermanagement_systemloginmaster] AS us  WITH(NOLOCK)
			ON us.id = cc.custid
			WHERE cc.userid='''+@appuserid+''';

			SELECT
				@count_of_call = COUNT(*)
			FROM ['+@DBNAME+'].[dbo].[CallLog] AS c WITH(NOLOCK)
			WHERE ISNULL(c.ProjectID,0) = @_custid
			AND CAST(c.EntryDate AS DATE) >= DATEADD(DAY, -15, CAST(ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE()) AS DATE));

			SELECT
				@count_of_ticket = COUNT(*)
			FROM  [' + @DBNAME + '].dbo.[CallLog_Tickets] AS ct WITH (NOLOCK)
			WHERE ISNULL(ct.ProjectID,0) = @_custid
			AND ct.statusid <> 37;

			SELECT 
				@count_of_order = COUNT(*)
			FROM [' + @DBNAME + '].[dbo].[DeliveryDashboard] AS dd WITH (NOLOCK) 
			WHERE dd.ClientCode = @_custcode
			AND dd.Status = ''Pending'';

			SELECT
				@count_of_training = COUNT(*)
			FROM [' + @DBNAME + '].[dbo].[Training_Session_Details] tsd WITH (NOLOCK)
			WHERE tsd.ProjectCode = @_custid
			AND tsd.Status = ''Pending'';

			SELECT 
				@count_of_call AS count_of_call
				,@count_of_ticket AS count_of_ticket
				,@count_of_order AS count_of_order
				,@count_of_training AS count_of_training;
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode,'')='ADDFLLOWUPCALL')
	BEGIN
		SET @SQL = '
			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog] WITH(NOLOCK) 
				WHERE CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
			)
			BEGIN
				
				INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] (
					CallLogId, Description, CreatedBy, CreatedDate
				) VALUES (
					' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
					,'''+REPLACE(CONVERT(NVARCHAR(max), ISNULL(RTRIM(LTRIM(@Descr)), '')), '''', '''''') +''' 
					,' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
					,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
				)

				SELECT  
					1 as stat
					,''Call Added successfully'' as stat_msg
					,1000 as stat_code	


				 SELECT DISTINCT TOP 1
					 c.CallLogId sr
					,c.EntryDate date
					,u.customercode company
					,c.CustomerName callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr,'''') description
					,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
						  ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname,'''')  AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name,'''') AS status
					,ISNULL(s2.Name,'''') AS Estatus				
					,ISNULL(c.Feedback,'''') AS feedback
					,ISNULL(c.RatingByCustomer,0) AS rating
					,c.Source topicRaisedBy
					,ISNULL(p.Name,'''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed			  
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
							), ''00:00:00''), 108),
					'''') AS CallDuration
					,ISNULL(c.CallDetails,'''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
					,ISNULL(c.ParentId,'''') parentId
				';
				PRINT(@SQL)
				SET @SQL1 = '
					,ISNULL(REPLACE((
						SELECT 
							f.Id,
							f.CallStart,
							f.CallClosed,
							CONVERT(VARCHAR(8),
								DATEADD(SECOND, ISNULL(f.CallDuration,0), 0),
							108) AS CallDuration,
							CASE 
								WHEN ISNULL(f.CreatedBy, 0) = 0 THEN '''' 
								ELSE LTRIM(RTRIM(
									ISNULL(up1.firstname, '''') + '' '' +
									CASE WHEN ISNULL(up1.middlename, '''') <> '''' THEN up1.middlename + '' '' ELSE '''' END +
									ISNULL(up1.lastname, '''')
								))
							 END AS CreatedBy,
							 CASE 
								WHEN ISNULL(f.ReceivedBy, 0) = 0 THEN '''' 
								ELSE LTRIM(RTRIM(
									ISNULL(up2.firstname, '''') + '' '' +
									CASE WHEN ISNULL(up2.middlename, '''') <> '''' THEN up2.middlename + '' '' ELSE '''' END +
									ISNULL(up2.lastname, '''')
								))
							 END AS ReceivedBy,
							 CASE 
								WHEN ISNULL(f.ForwardedEmpId, 0) = 0 THEN '''' 
								ELSE LTRIM(RTRIM(
									ISNULL(up3.firstname, '''') + '' '' +
									CASE WHEN ISNULL(up3.middlename, '''') <> '''' THEN up3.middlename + '' '' ELSE '''' END +
									ISNULL(up3.lastname, '''')
								))
							 END AS ForwardedEmp,
							 ISNULL(ss1.Name, '''') AS InternalStatus,
							 ISNULL(f.InternalStatus, 0) AS InternalStatusId,
							 ISNULL(f.Description, '''') AS Description,
							 f.CreatedDate
						FROM ['+@DBNAME+'].dbo.CallLog_Follow_Up f WITH(NOLOCK)
						LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up1 WITH(NOLOCK)
						  ON f.CreatedBy = up1.id
						LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up2 WITH(NOLOCK)
						  ON f.ReceivedBy = up2.id
						LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up3 WITH(NOLOCK)
						  ON f.ForwardedEmpId = up3.id
						LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] ss1 WITH(NOLOCK)
						  ON f.InternalStatus = ss1.StatusID
						WHERE f.CallLogId = c.CallLogId
						ORDER BY f.Id DESC
						FOR JSON PATH
					), ''\/'',''/''),'''') AS FollowUpList
					FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)						
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			 			  ON c.ProjectID = u.id
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 			  ON c.AppId = A.AppId
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 			  ON c.InternalStatusID = s1.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 			  ON c.ExternalStatusID = s2.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 			  ON c.Priorityid = p.Priorityid			
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 			  ON c.CallLogId = t.CallLogId			
					 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 			  ON md1.id = c.DeptId
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
			 			  ON c.EmpId = e.id
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 			  ON c.createdby = e1.id		
					 WHERE c.IsActive = 1 AND c.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'
					 GROUP BY
						c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
						c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
						s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
						c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
						t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
						c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname
			END
			ELSE
			BEGIN
				 SELECT
					0 AS stat
					,''CallLogId does not exists'' AS stat_msg
					,1001 AS stat_code;
			END
		';
		PRINT(@SQL1)
		EXEC(@SQL+@SQL1)
	END
	ELSE IF (ISNULL(@mode,'')='EDITFLLOWUPCALL')
	BEGIN
		SET @SQL = '
			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] WITH(NOLOCK) 
				WHERE Id = ' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
				AND CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
			)
			BEGIN
				DECLARE
					@InternalStatus INT = ' + CONVERT(NVARCHAR(30), @StatusId) + ',
					@ForwardedEmpId INT = ' + CONVERT(NVARCHAR(30), @EmpId) + ',
					@Description NVARCHAR(MAX)= '''+REPLACE(CONVERT(NVARCHAR(max), ISNULL(RTRIM(LTRIM(@Descr)), '')), '''', '''''') +''';
			
				UPDATE cfu
					SET  
						cfu.InternalStatus = ISNULL(@InternalStatus, cfu.Description)
						,cfu.Description = ISNULL(@Description, cfu.Description)
						,cfu.ForwardedEmpId = ISNULL(@ForwardedEmpId, cfu.ForwardedEmpId)
					FROM [' + @DBNAME + '].dbo.[CallLog_Follow_Up] cfu WITH(NOLOCK)
					WHERE cfu.Id = ' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
					AND cfu.CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '

				SELECT  
					1 as stat
					,''Call update successfully'' as stat_msg
					,1000 as stat_code

			END
			ELSE
			BEGIN
				 SELECT
					0 AS stat
					,''Call does not exists'' AS stat_msg
					,1001 AS stat_code;
			END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode,'')='STARTFLLOWUPCALL')
	BEGIN
		SET @SQL = '
			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] WITH(NOLOCK) 
				WHERE Id = ' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
				AND CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
			)
			BEGIN
				
				UPDATE cfu
					SET cfu.CallStart = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
						,cfu.ReceivedBy = ' + CONVERT(NVARCHAR(255), ISNULL(@CreatedBy, 0)) + '
				FROM [' + @DBNAME + '].dbo.[CallLog_Follow_Up] cfu WITH(NOLOCK)
				WHERE cfu.Id = ' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
				AND cfu.CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '

				SELECT
					1 AS stat
					,''Call start successfully'' AS stat_msg
					,1000 AS stat_code;
				
				 SELECT DISTINCT TOP 1
					 c.CallLogId sr
					,c.EntryDate date
					,u.customercode company
					,c.CustomerName callBy
					,ISNULL(A.appname,'''') appname
					,ISNULL(c.Descr,'''') description
					,CASE WHEN ISNULL(c.createdby,0) = 0 THEN '''' 
						  ELSE LTRIM(RTRIM(
							ISNULL(e1.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e1.middlename, '''') <> '''' THEN e1.middlename + '' '' ELSE '''' END +
							ISNULL(e1.lastname, '''')
						)) 
					 END AS receivedBy
					,FORMAT(c.CreatedDate, ''HH:mm'') AS time
					,ISNULL(md1.Designationname,'''')  AS DeptName
					,CASE 
						WHEN ISNULL(c.EmpId, 0) = 0 THEN ''''
						ELSE LTRIM(RTRIM(
							ISNULL(e.firstname, '''') + '' '' +
							CASE WHEN ISNULL(e.middlename, '''') <> '''' THEN e.middlename + '' '' ELSE '''' END +
							ISNULL(e.lastname, '''')
						)) 
					 END AS AssignedEmpName
					,ISNULL(s1.Name,'''') AS status
					,ISNULL(s2.Name,'''') AS Estatus				
					,ISNULL(c.Feedback,'''') AS feedback
					,ISNULL(c.RatingByCustomer,0) AS rating
					,c.Source topicRaisedBy
					,ISNULL(p.Name,'''') AS priority
					,ISNULL(CONVERT(VARCHAR, c.StartDate, 120), '''') AS callStart
					,ISNULL(CONVERT(VARCHAR, c.EndDate, 120), '''') AS callClosed			  
					,ISNULL(
						CONVERT(VARCHAR(8), 
							DATEADD(SECOND, DATEDIFF(SECOND, c.StartDate, c.EndDate) - (
								ISNULL(DATEPART(HOUR,   TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 3600 +
								ISNULL(DATEPART(MINUTE, TRY_CAST(c.TotalPausedTime AS TIME)), 0) * 60 +
								ISNULL(DATEPART(SECOND, TRY_CAST(c.TotalPausedTime AS TIME)), 0)
							), ''00:00:00''), 108),
					'''') AS CallDuration
					,ISNULL(c.CallDetails,'''') AS callDetails
					,ISNULL(t.TicketNo, '''') AS ticket
					,ISNULL(CONVERT(VARCHAR, t.CreatedDate, 120), '''') AS Ticket_CreatedDate
					,ISNULL(c.ParentId,'''') parentId
				';
				PRINT(@SQL)
				SET @SQL1 = '
					,ISNULL(REPLACE((
						SELECT 
							f.Id,
							f.CallStart,
							f.CallClosed,
							CONVERT(VARCHAR(8),
								DATEADD(SECOND, ISNULL(f.CallDuration,0), 0),
							108) AS CallDuration,
							CASE 
								WHEN ISNULL(f.CreatedBy, 0) = 0 THEN '''' 
								ELSE LTRIM(RTRIM(
									ISNULL(up1.firstname, '''') + '' '' +
									CASE WHEN ISNULL(up1.middlename, '''') <> '''' THEN up1.middlename + '' '' ELSE '''' END +
									ISNULL(up1.lastname, '''')
								))
							 END AS CreatedBy,
							 CASE 
								WHEN ISNULL(f.ReceivedBy, 0) = 0 THEN '''' 
								ELSE LTRIM(RTRIM(
									ISNULL(up2.firstname, '''') + '' '' +
									CASE WHEN ISNULL(up2.middlename, '''') <> '''' THEN up2.middlename + '' '' ELSE '''' END +
									ISNULL(up2.lastname, '''')
								))
							 END AS ReceivedBy,
							 CASE 
								WHEN ISNULL(f.ForwardedEmpId, 0) = 0 THEN '''' 
								ELSE LTRIM(RTRIM(
									ISNULL(up3.firstname, '''') + '' '' +
									CASE WHEN ISNULL(up3.middlename, '''') <> '''' THEN up3.middlename + '' '' ELSE '''' END +
									ISNULL(up3.lastname, '''')
								))
							 END AS ForwardedEmp,
							 ISNULL(ss1.Name, '''') AS InternalStatus,
							 ISNULL(f.InternalStatus, 0) AS InternalStatusId,
							 ISNULL(f.Description, '''') AS Description
						FROM ['+@DBNAME+'].dbo.CallLog_Follow_Up f WITH(NOLOCK)
						LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up1 WITH(NOLOCK)
						  ON f.CreatedBy = up1.id
						LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up2 WITH(NOLOCK)
						  ON f.ReceivedBy = up2.id
						LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] up3 WITH(NOLOCK)
						  ON f.ReceivedBy = up3.id
						LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] ss1 WITH(NOLOCK)
						  ON f.InternalStatus = ss1.StatusID
						WHERE f.CallLogId = c.CallLogId
						ORDER BY f.Id DESC
						FOR JSON PATH
					), ''\/'',''/''),'''') AS FollowUpList
					FROM ['+@DBNAME+'].dbo.[CallLog] c WITH(NOLOCK)						
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] u WITH(NOLOCK)
			 			  ON c.ProjectID = u.id
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_AppName] A WITH(NOLOCK)
			 			  ON c.AppId = A.AppId
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s1 WITH(NOLOCK)
			 			  ON c.InternalStatusID = s1.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_status] s2 WITH(NOLOCK)
			 			  ON c.ExternalStatusID = s2.StatusID
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Priority] p WITH(NOLOCK)
			 			  ON c.Priorityid = p.Priorityid			
					 LEFT JOIN ['+@DBNAME+'].dbo.[CallLog_Tickets] t WITH(NOLOCK)
			 			  ON c.CallLogId = t.CallLogId			
					 LEFT JOIN ['+@DBNAME+'].dbo.[Mastermanagement_Designation] md1 WITH(NOLOCK)
			 			  ON md1.id = c.DeptId
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e WITH(NOLOCK) 
			 			  ON c.EmpId = e.id
					 LEFT JOIN ['+@DBNAME+'].dbo.[Usermanagement_systemloginmaster] e1 WITH(NOLOCK) 
			 			  ON c.createdby = e1.id		
					 WHERE c.IsActive = 1 AND c.CallLogId = '+CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0))+'
					 GROUP BY 
							  c.CallLogId, c.EntryDate, u.customercode, c.CustomerName, A.AppName,
							  c.Descr, FORMAT(c.CreatedDate, ''HH:mm''),e.firstname, e.middlename, e.lastname,
							  s1.Name,s2.Name, c.Feedback, c.RatingByCustomer,e1.firstname, e1.middlename, e1.lastname,
							  c.Source, p.Name, c.StartDate, c.EndDate, c.CallDetails,
							  t.TicketNo, t.CreatedDate,  c.TotalPausedTime,
							  c.createdby, c.ParentId,c.EmpId,c.createdby,md1.Designationname

			END
			ELSE
			BEGIN
				 SELECT
					0 AS stat
					,''Call does not exists'' AS stat_msg
					,1001 AS stat_code;
			END
		';
		PRINT(@SQL1)
		EXEC(@SQL+@SQL1)
	END
	ELSE IF (ISNULL(@mode,'')='ENDFLLOWUPCALL')
	BEGIN
		SET @SQL = '
			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] WITH(NOLOCK) 
				WHERE Id = ' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
				AND CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
				AND CallStart IS NOT NULL
			)
			BEGIN
				
				UPDATE cfu
					SET cfu.CallClosed = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
					,cfu.CallDuration =
						DATEDIFF(SECOND, cfu.CallStart, ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE()))
						-
						ISNULL(
							(
								SELECT SUM(
									DATEDIFF(
										SECOND,
										pl.PauseStart,
										ISNULL(pl.PauseEnd, ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE()))
									)
								)
								FROM [' + @DBNAME + '].dbo.CallLog_FollowUp_PauseLog pl WITH(NOLOCK)
								WHERE pl.FollowId = cfu.Id
							), 0
						)
				FROM [' + @DBNAME + '].dbo.[CallLog_Follow_Up] cfu WITH(NOLOCK)
				WHERE cfu.Id = ' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
				AND cfu.CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '

				SELECT
					1 AS stat
					,''Call start successfully'' AS stat_msg
					,1000 AS stat_code;

			END
			ELSE
			BEGIN
				 SELECT
					0 AS stat
					,''Call does not exists'' AS stat_msg
					,1001 AS stat_code;
			END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode,'')='PAUSEFLLOWUPCALL')
	BEGIN
		SET @SQL = '
			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] WITH(NOLOCK) 
				WHERE Id = ' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
				AND CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
				AND CallStart IS NOT NULL
			)
			BEGIN
				INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_FollowUp_PauseLog] (
					FollowId, PauseStart
				) VALUES (
					' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
					,ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE())
				)

				SELECT
					1 as stat
					,''Current call Pused.'' as stat_msg
					,1000 as stat_code	

			END
			ELSE
			BEGIN
				SELECT
					0 AS stat
					,''Call does not exists'' AS stat_msg
					,1001 AS stat_code;
			END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode,'')='RESUMEFLLOWUPCALL')
	BEGIN
		SET @SQL = '
			IF EXISTS(
				SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_FollowUp_PauseLog] AS cfp WITH(NOLOCK)
				INNER JOIN ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] AS cfu WITH(NOLOCK)
				ON cfu.Id = cfp.FollowId
				WHERE cfu.Id = ' + CONVERT(NVARCHAR(255), ISNULL(@FollowUpCallId, 0)) + '
				AND cfu.CallLogId = ' + CONVERT(NVARCHAR(255), ISNULL(@CallLogid, 0)) + '
			)
			BEGIN

				UPDATE cfp
					SET cfp.PauseEnd = ISNULL(dbo.[UTC_CSERVERLOCAL](GETDATE()),GETDATE())
				FROM ['+@DBNAME+'].[dbo].[CallLog_FollowUp_PauseLog] cfp WITH(NOLOCK)
				WHERE cfp.FollowId = '+CONVERT(NVARCHAR(255),ISNULL(@FollowUpCallId,0))+' 
				AND cfp.PauseEnd IS NULL

				SELECT
					1 as stat
					,''Current call Resumed.'' as stat_msg
					,1000 as stat_code	

			END
			ELSE
			BEGIN
				SELECT
					0 AS stat
					,''Call does not exists'' AS stat_msg
					,1001 AS stat_code;
			END
		';
		PRINT(@SQL)
		EXEC(@SQL)
	END
	ELSE IF (ISNULL(@mode,'')='RESTOREARCHIVE')
	BEGIN
		DROP TABLE IF EXISTS #RestoreIdsTbl
		CREATE TABLE #RestoreIdsTbl (CallLogId INT PRIMARY KEY)

		INSERT INTO #RestoreIdsTbl (CallLogId)
		SELECT DISTINCT value
		FROM OPENJSON(@p, '$.RestoreIds')

		IF NOT EXISTS (SELECT 1 FROM #RestoreIdsTbl)
		BEGIN
			SELECT 
					0 AS stat
				,'Please provide CallLogId(s) to restore.' AS stat_msg
				,1001 AS stat_code;
			RETURN;
		END

		DECLARE @RestoredById INT = 0
		SET @SQL = '
			SELECT @ResolvedId = ISNULL(id,0)
			FROM ['+@DBNAME+'].[dbo].[usermanagement_systemloginmaster] WITH(NOLOCK)
			WHERE userid = '''+REPLACE(@appuserid,'''','''''')+'''
		'
		EXEC sp_executesql @SQL, N'@ResolvedId INT OUTPUT', @ResolvedId = @RestoredById OUTPUT

		SET @SQL = CAST('' AS NVARCHAR(MAX)) + '
			DECLARE @RestoreDate DATETIME = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()),GETDATE());

			IF OBJECT_ID(''tempdb..#RestoreCallLogIds'') IS NOT NULL DROP TABLE #RestoreCallLogIds;

			SELECT ac.CallLogId
			INTO #RestoreCallLogIds
			FROM ['+@DBNAME+'].[dbo].[Archived_CallLog] ac WITH(NOLOCK)
			INNER JOIN #RestoreIdsTbl r ON r.CallLogId = ac.CallLogId;

			CREATE UNIQUE CLUSTERED INDEX IX_Temp_RestoreCallLogIds ON #RestoreCallLogIds(CallLogId);

			IF EXISTS (SELECT 1 FROM #RestoreCallLogIds)
			BEGIN
				BEGIN TRY
					BEGIN TRAN;

					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog]
						(CallLogId, EntryDate, ProjectID, CustomerName, AppId, Descr, DeptId, EmpId,
							InternalStatusID, ExternalStatusID, StartDate, EndDate, ParentId, PriorityID,
							Feedback, RatingByCustomer, CallDetails, Source, TotalPausedtime, IsActive,
							CreatedBy, CreatedDate, UpdatedBy, ModifiedDate, CreatedByCode, UpdatedByCode,
							IsClient, ProjectCode, CorpId, CallTypeId, TaskId, RatingDateTime,
							IsUnArchived, IsUnArchivedDate, IsUnArchivedBy)
					SELECT 
							ac.CallLogId, ac.EntryDate, ac.ProjectID, ac.CustomerName, ac.AppId, ac.Descr, ac.DeptId, ac.EmpId,
							ac.InternalStatusID, ac.ExternalStatusID, ac.StartDate, ac.EndDate, ac.ParentId, ac.PriorityID,
							ac.Feedback, ac.RatingByCustomer, ac.CallDetails, ac.Source, ac.TotalPausedtime, 1,
							ac.CreatedBy, ac.CreatedDate, ac.UpdatedBy, ac.ModifiedDate, ac.CreatedByCode, ac.UpdatedByCode,
							ac.IsClient, ac.ProjectCode, ac.CorpId, ac.CallTypeId, ac.TaskId, ac.RatingDateTime,
							1, @RestoreDate, '+CONVERT(NVARCHAR(20),@RestoredById)+'
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog] ac WITH(NOLOCK)
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = ac.CallLogId
					WHERE NOT EXISTS (
						SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog] c WITH(NOLOCK) WHERE c.CallLogId = ac.CallLogId
					);

					SET IDENTITY_INSERT ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] ON;

					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Follow_Up]
						(Id, CallLogId, CallStart, CallClosed, CallDuration, CreatedBy, ReceivedBy,
							InternalStatus, CreatedDate, Description, ForwardedEmpId, IsForwardFollowup, ResonId)
					SELECT 
							af.Id, af.CallLogId, af.CallStart, af.CallClosed, af.CallDuration, af.CreatedBy, af.ReceivedBy,
							af.InternalStatus, af.CreatedDate, af.Description, af.ForwardedEmpId, af.IsForwardFollowup, af.ResonId
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_Follow_Up] af WITH(NOLOCK)
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = af.CallLogId
					WHERE NOT EXISTS (
						SELECT 1 FROM ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] f WITH(NOLOCK) WHERE f.Id = af.Id
					);

					SET IDENTITY_INSERT ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] OFF;

					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_FollowUp_PauseLog]
						(FollowId, PauseStart, PauseEnd)
					SELECT afp.FollowId, afp.PauseStart, afp.PauseEnd
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_FollowUp_PauseLog] afp WITH(NOLOCK)
					INNER JOIN ['+@DBNAME+'].[dbo].[Archived_CallLog_Follow_Up] af WITH(NOLOCK) ON af.Id = afp.FollowId
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = af.CallLogId;

					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_PauseLog]
						(CallLogId, PauseStart, PauseEnd)
					SELECT ap.CallLogId, ap.PauseStart, ap.PauseEnd
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_PauseLog] ap WITH(NOLOCK)
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = ap.CallLogId;

					INSERT INTO ['+@DBNAME+'].[dbo].[CallLog_Comments]
						(CallLogId, Comments, FilePath, CreatedBy, CreatedDate, IsClient)
					SELECT acm.CallLogId, acm.Comments, acm.FilePath, acm.CreatedBy, acm.CreatedDate, acm.IsClient
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_Comments] acm WITH(NOLOCK)
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = acm.CallLogId;

					DELETE afp
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_FollowUp_PauseLog] afp
					INNER JOIN ['+@DBNAME+'].[dbo].[Archived_CallLog_Follow_Up] af ON af.Id = afp.FollowId
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = af.CallLogId;

					DELETE af
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_Follow_Up] af
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = af.CallLogId;

					DELETE ap
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_PauseLog] ap
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = ap.CallLogId;

					DELETE acm
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog_Comments] acm
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = acm.CallLogId;

					DELETE ac
					FROM ['+@DBNAME+'].[dbo].[Archived_CallLog] ac
					INNER JOIN #RestoreCallLogIds t ON t.CallLogId = ac.CallLogId;

					COMMIT TRAN;

					SELECT 
							1 AS stat
						,''Selected CallLogId(s) restored successfully.'' AS stat_msg
						,1000 AS stat_code;
				END TRY
				BEGIN CATCH
					IF @@TRANCOUNT > 0
						ROLLBACK TRAN;

					IF OBJECTPROPERTY(OBJECT_ID(''['+@DBNAME+'].[dbo].[CallLog_Follow_Up]''), ''TableHasIdentity'') = 1
					BEGIN
						SET IDENTITY_INSERT ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] OFF;
					END

					SELECT 
							0 AS stat
						,CONCAT(''Restore failed and changes were rolled back. Error: '', ERROR_MESSAGE()) AS stat_msg
						,1001 AS stat_code;
				END CATCH
			END
			ELSE
			BEGIN
				SELECT 
						0 AS stat
					,''No archived data found for the given CallLogId(s).'' AS stat_msg
					,1001 AS stat_code;
			END

			IF OBJECT_ID(''tempdb..#RestoreCallLogIds'') IS NOT NULL DROP TABLE #RestoreCallLogIds;
		'
		EXEC (@SQL)
	END

	--SET @ARC = CAST('' AS NVARCHAR(MAX)) + '
	--			DECLARE @ArchiveDate DATETIME = ISNULL([dbo].[UTC_CSERVERLOCAL](GETDATE()), GETDATE());

	--			IF OBJECT_ID(''tempdb..#ArchiveCallLogIds'') IS NOT NULL DROP TABLE #ArchiveCallLogIds;

	--			SELECT c.CallLogId
	--			INTO #ArchiveCallLogIds
	--			FROM ['+@DBNAME+'].[dbo].[CallLog] c WITH(NOLOCK)
	--			WHERE ISNULL(c.ExternalStatusID,0) IN (
	--				SELECT StatusID FROM ['+@DBNAME+'].[dbo].[CallLog_status] WITH(NOLOCK)
	--				WHERE IsActive = 1 AND Name IN (''Completed'',''Solved'',''Delivered'')
	--			)
	--			AND
	--			(
	--				(ISNULL(c.IsUnArchived,0) = 0 AND c.ModifiedDate <= DATEADD(DAY, -30, @ArchiveDate))
	--				OR
	--				(ISNULL(c.IsUnArchived,0) = 1 AND c.IsUnArchivedDate <= DATEADD(DAY, -30, @ArchiveDate))
	--			);

	--			CREATE UNIQUE CLUSTERED INDEX IX_Temp_ArchiveCallLogIds ON #ArchiveCallLogIds(CallLogId);

	--			IF EXISTS (SELECT 1 FROM #ArchiveCallLogIds)
	--			BEGIN
	--				BEGIN TRY
	--					BEGIN TRAN;

	--					INSERT INTO ['+@DBNAME+'].[dbo].[Archived_CallLog_FollowUp_PauseLog]
	--						(FollowId, PauseStart, PauseEnd, ArchiveEntryDate)
	--					SELECT fp.FollowId, fp.PauseStart, fp.PauseEnd, @ArchiveDate
	--					FROM ['+@DBNAME+'].[dbo].[CallLog_FollowUp_PauseLog] fp WITH(NOLOCK)
	--					INNER JOIN ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] f WITH(NOLOCK) ON f.Id = fp.FollowId
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = f.CallLogId;

	--					INSERT INTO ['+@DBNAME+'].[dbo].[Archived_CallLog_Follow_Up]
	--						(CallLogId, CallStart, CallClosed, CallDuration, CreatedBy, ReceivedBy, InternalStatus, CreatedDate, Description, ForwardedEmpId, ArchiveEntryDate, IsForwardFollowup, ResonId)
	--					SELECT f.CallLogId, f.CallStart, f.CallClosed, f.CallDuration, f.CreatedBy, f.ReceivedBy, f.InternalStatus, f.CreatedDate, f.Description, f.ForwardedEmpId, @ArchiveDate, f.IsForwardFollowup, f.ResonId
	--					FROM ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] f WITH(NOLOCK)
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = f.CallLogId;

	--					INSERT INTO ['+@DBNAME+'].[dbo].[Archived_CallLog_PauseLog]
	--						(PauseId, CallLogId, PauseStart, PauseEnd, ArchiveEntryDate)
	--					SELECT p.PauseId, p.CallLogId, p.PauseStart, p.PauseEnd, @ArchiveDate
	--					FROM ['+@DBNAME+'].[dbo].[CallLog_PauseLog] p WITH(NOLOCK)
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = p.CallLogId;


	--					INSERT INTO ['+@DBNAME+'].[dbo].[Archived_CallLog_Comments]
	--						(CallLogId, Comments, FilePath, CreatedBy, CreatedDate, ArchiveEntryDate)
	--					SELECT cm.CallLogId, cm.Comments, cm.FilePath, cm.CreatedBy, cm.CreatedDate, @ArchiveDate
	--					FROM ['+@DBNAME+'].[dbo].[CallLog_Comments] cm WITH(NOLOCK)
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = cm.CallLogId;

	--					INSERT INTO ['+@DBNAME+'].[dbo].[Archived_CallLog]
	--						(CallLogId, EntryDate, ProjectID, CustomerName, AppId, Descr, DeptId, EmpId, InternalStatusID, ExternalStatusID, StartDate, EndDate, ParentId, PriorityID, Feedback, RatingByCustomer, CallDetails, Source, TotalPausedtime, IsActive, CreatedBy, CreatedDate, UpdatedBy, ModifiedDate, CreatedByCode, UpdatedByCode, IsClient, ProjectCode, CorpId, CallTypeId, TaskId, RatingDateTime, ArchiveEntryDate)
	--					SELECT c.CallLogId, c.EntryDate, c.ProjectID, c.CustomerName, c.AppId, c.Descr, c.DeptId, c.EmpId, c.InternalStatusID, c.ExternalStatusID, c.StartDate, c.EndDate, c.ParentId, c.PriorityID, c.Feedback, c.RatingByCustomer, c.CallDetails, c.Source, c.TotalPausedtime, c.IsActive, c.CreatedBy, c.CreatedDate, c.UpdatedBy, c.ModifiedDate, c.CreatedByCode, c.UpdatedByCode, c.IsClient, c.ProjectCode, c.CorpId, c.CallTypeId, c.TaskId, c.RatingDateTime, @ArchiveDate
	--					FROM ['+@DBNAME+'].[dbo].[CallLog] c WITH(NOLOCK)
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = c.CallLogId;

	--					DELETE fp
	--					FROM ['+@DBNAME+'].[dbo].[CallLog_FollowUp_PauseLog] fp
	--					INNER JOIN ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] f ON f.Id = fp.FollowId
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = f.CallLogId;

	--					DELETE f
	--					FROM ['+@DBNAME+'].[dbo].[CallLog_Follow_Up] f
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = f.CallLogId;

	--					DELETE p
	--					FROM ['+@DBNAME+'].[dbo].[CallLog_PauseLog] p
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = p.CallLogId;

	--					DELETE cm
	--					FROM ['+@DBNAME+'].[dbo].[CallLog_Comments] cm
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = cm.CallLogId;

	--					DELETE c
	--					FROM ['+@DBNAME+'].[dbo].[CallLog] c
	--					INNER JOIN #ArchiveCallLogIds t ON t.CallLogId = c.CallLogId;

	--					COMMIT TRAN;
	--				END TRY
	--				BEGIN CATCH
	--					IF @@TRANCOUNT > 0
	--						ROLLBACK TRAN;
	--				END CATCH
	--			END

	--			IF OBJECT_ID(''tempdb..#ArchiveCallLogIds'') IS NOT NULL DROP TABLE #ArchiveCallLogIds;
	--		';
	-- PRINT (@ARC)
	-- EXEC(@ARC)


--------------------------------------------------------------------------------------------------------------	
EXECUTE [GetTxLog] @spname,@FROMDate,@DBNAME,@appuserid,@IPAddress,@FormName,'CallLogv4',@mode
END TRY
BEGIN CATCH	     
	
	SELECT
		0 as stat
		,'"Contact your Admin"' as stat_msg
		,1001 as stat_code
		,'null' as device_token
	
	EXECUTE   [GetErrlog] @appuserid,@FROMDate,@DBNAME,@spname,@IPAddress,@FormName,'CallLogv4',@mode;
END CATCH;
END